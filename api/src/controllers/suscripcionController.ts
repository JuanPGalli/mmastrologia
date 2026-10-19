import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { Suscripcion, ISuscripcion, SuscripcionStatus } from "../models/Suscripcion";
import { User } from "../models/User";
import { ConflictError, ValidationError } from "../utils/errors";

const getClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN no está configurada.");
  }
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
};

const obtenerPrecioMensual = (): number => {
  const precio = Number(process.env.MP_SUSCRIPCION_PRECIO_ARS);
  if (!precio || precio <= 0) {
    throw new Error(
      "MP_SUSCRIPCION_PRECIO_ARS no está configurada (precio mensual de la suscripción en pesos)."
    );
  }
  return precio;
};

const DIA_MS = 24 * 60 * 60 * 1000;
// Tolerancia: el cobro mensual puede procesarse unas horas después de la
// fecha prevista; sin esto, alguien que pagó quedaría un rato sin acceso.
const GRACIA_MS = 2 * DIA_MS;
const ESTADOS_VALIDOS: SuscripcionStatus[] = ["pending", "authorized", "paused", "cancelled"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Qué fecha de vigencia corresponde guardar según lo que informa Mercado
// Pago. Solo una suscripción "authorized" extiende la vigencia; en cualquier
// otro estado (cancelada, pausada, pendiente) se conserva lo que ya estaba
// pago. Función pura, sin acceso a base ni a red.
export const calcularVigenteHasta = (
  status: SuscripcionStatus,
  proximoCobro: Date | undefined,
  vigentePrevio: Date | undefined,
  ahora: Date
): Date | undefined => {
  if (status !== "authorized") return vigentePrevio;
  return proximoCobro ?? new Date(ahora.getTime() + 32 * DIA_MS);
};

const normalizarEstado = (status: string | undefined, actual: SuscripcionStatus): SuscripcionStatus =>
  ESTADOS_VALIDOS.includes(status as SuscripcionStatus) ? (status as SuscripcionStatus) : actual;

// Trae el estado real desde Mercado Pago y lo copia a nuestra base. Es la
// única fuente de verdad: lo usan el webhook, el retorno desde MP y la
// verificación de acceso, así que ninguno depende de que el webhook llegue.
export const sincronizarSuscripcion = async (suscripcion: ISuscripcion) => {
  const detalle = await new PreApproval(getClient()).get({ id: suscripcion.mpPreapprovalId });

  const status = normalizarEstado(detalle.status, suscripcion.status);
  const proximoCobro = detalle.next_payment_date ? new Date(detalle.next_payment_date) : undefined;

  suscripcion.status = status;
  suscripcion.vigenteHasta = calcularVigenteHasta(status, proximoCobro, suscripcion.vigenteHasta, new Date());
  await suscripcion.save();
  return suscripcion;
};

const vigenteQuery = (userId: string) => ({
  userId,
  vigenteHasta: { $gt: new Date(Date.now() - GRACIA_MS) },
});

export const crearSuscripcion = async (userId: string, emailCuenta: string, payerEmailPedido?: string) => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error("FRONTEND_URL no está configurada.");
  }

  if (await Suscripcion.exists({ ...vigenteQuery(userId), status: "authorized" })) {
    throw new ConflictError("Ya tenés una suscripción activa.");
  }

  // El email con el que se paga en Mercado Pago tiene que coincidir con
  // payer_email, o MP rechaza el pago. Puede ser distinto al de la cuenta del
  // sitio, así que la persona lo puede indicar.
  const payerEmail = (payerEmailPedido ?? emailCuenta).trim().toLowerCase();
  if (!EMAIL_REGEX.test(payerEmail)) {
    throw new ValidationError("Ingresá un email válido: el de tu cuenta de Mercado Pago.");
  }

  const monto = obtenerPrecioMensual();

  const resultado = await new PreApproval(getClient()).create({
    body: {
      reason: "Astrólogo Virtual — suscripción mensual (María Marta Galli)",
      external_reference: userId,
      payer_email: payerEmail,
      back_url: `${frontendUrl.replace(/\/$/, "")}/astrologo-virtual?suscripcion=ok`,
      // "pending": queda a la espera de que la persona cargue su medio de
      // pago en el checkout de MP (devuelve init_point).
      status: "pending",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: monto,
        currency_id: "ARS",
      },
    },
  });

  if (!resultado.id || !resultado.init_point) {
    throw new Error("Mercado Pago no devolvió los datos esperados para la suscripción.");
  }

  await Suscripcion.create({
    userId,
    mpPreapprovalId: resultado.id,
    status: "pending",
    monto,
    moneda: "ARS",
    payerEmail,
  });

  return { initPoint: resultado.init_point };
};

export const obtenerEstadoSuscripcion = async (userId: string) => {
  const suscripciones = await Suscripcion.find({ userId }).sort({ createdAt: -1 });
  const user = await User.findById(userId);
  const limite = Date.now() - GRACIA_MS;

  const vigente = suscripciones.find((s) => s.vigenteHasta && s.vigenteHasta.getTime() > limite);
  const referencia = vigente ?? suscripciones[0];

  return {
    activa: Boolean(vigente),
    status: referencia?.status ?? null,
    // true = se renueva sola; false con activa = cancelada, conserva el acceso
    // hasta vigenteHasta porque ya lo pagó
    renueva: vigente?.status === "authorized",
    vigenteHasta: vigente?.vigenteHasta ?? null,
    pruebaGratisUsada: Boolean(user?.pruebaGratisUsada),
  };
};

// Se llama al volver desde Mercado Pago: consulta el estado real de las
// suscripciones abiertas del usuario, sin esperar al webhook (que además no
// llega a localhost, así que esto también permite probar en desarrollo).
export const sincronizarSuscripcionesDelUsuario = async (userId: string) => {
  const abiertas = await Suscripcion.find({
    userId,
    status: { $in: ["pending", "authorized", "paused"] },
  })
    .sort({ createdAt: -1 })
    .limit(5);

  await Promise.allSettled(abiertas.map(sincronizarSuscripcion));
  return obtenerEstadoSuscripcion(userId);
};

export const cancelarSuscripcion = async (userId: string) => {
  const suscripcion = await Suscripcion.findOne({
    userId,
    status: { $in: ["authorized", "paused"] },
  }).sort({ createdAt: -1 });

  if (!suscripcion) {
    throw new ValidationError("No tenés una suscripción activa para cancelar.");
  }

  await new PreApproval(getClient()).update({
    id: suscripcion.mpPreapprovalId,
    body: { status: "cancelled" },
  });

  // vigenteHasta no se toca: ya pagó el período en curso y conserva el acceso.
  suscripcion.status = "cancelled";
  await suscripcion.save();

  return obtenerEstadoSuscripcion(userId);
};

// Llamado desde el webhook de Mercado Pago (mismo endpoint que Checkout Pro,
// ver paymentController.processPaymentWebhook).
export const procesarWebhookPreapproval = async (preapprovalId: string) => {
  const suscripcion = await Suscripcion.findOne({ mpPreapprovalId: preapprovalId });
  if (!suscripcion) return;
  await sincronizarSuscripcion(suscripcion);
};

// Chequeo de solo-lectura (salvo la auto-sincronización): no consume la
// prueba gratis; eso ocurre recién tras un uso exitoso (astroHandlers.ts).
export const tieneAccesoVigente = async (
  userId: string
): Promise<{ permitido: boolean; viaPrueba: boolean }> => {
  if (await Suscripcion.exists(vigenteQuery(userId))) return { permitido: true, viaPrueba: false };

  // Auto-sanación: una suscripción "authorized" con la vigencia vencida puede
  // haberse renovado sin que nos enterásemos (webhook perdido). Se consulta a
  // MP una vez; si de verdad se renovó, vuelve a tener acceso.
  const autorizadas = await Suscripcion.find({ userId, status: "authorized" });
  if (autorizadas.length > 0) {
    await Promise.allSettled(autorizadas.map(sincronizarSuscripcion));
    if (await Suscripcion.exists(vigenteQuery(userId))) return { permitido: true, viaPrueba: false };
  }

  const user = await User.findById(userId);
  if (!user) throw new ValidationError("Usuario no encontrado.");

  if (!user.pruebaGratisUsada) {
    return { permitido: true, viaPrueba: true };
  }

  return { permitido: false, viaPrueba: false };
};

export const marcarPruebaGratisUsada = async (userId: string) => {
  await User.findByIdAndUpdate(userId, { pruebaGratisUsada: true });
};
