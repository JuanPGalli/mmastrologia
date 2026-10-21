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
  console.log(
    `[suscripcion/sync] ${suscripcion.mpPreapprovalId}: MP status=${detalle.status}, ` +
      `next_payment_date=${detalle.next_payment_date ?? "-"} -> vigenteHasta=${suscripcion.vigenteHasta?.toISOString() ?? "-"}`
  );
  return suscripcion;
};

const vigenteQuery = (userId: string) => ({
  userId,
  vigenteHasta: { $gt: new Date(Date.now() - GRACIA_MS) },
});

// Sincroniza varias en paralelo SIN esconder los fallos: un error de Mercado
// Pago (token, red, id inválido) queda en los logs en vez de perderse.
const sincronizarVarias = async (suscripciones: ISuscripcion[]) => {
  const resultados = await Promise.allSettled(suscripciones.map(sincronizarSuscripcion));
  resultados.forEach((resultado, i) => {
    if (resultado.status === "rejected") {
      console.error(`[suscripcion/sync] no se pudo sincronizar ${suscripciones[i].mpPreapprovalId}:`, resultado.reason);
    }
  });
};

const PENDIENTE_MAX_MS = 7 * DIA_MS;

// Revisa contra Mercado Pago lo que pudo cambiar sin que nos enterásemos
// (webhook sin configurar o perdido, vuelta del checkout sin el parámetro):
// las "authorized" (renovaciones) y las "pending" recientes (pago recién
// hecho). Devuelve cuántas revisó.
const reconciliar = async (userId: string): Promise<number> => {
  const aRevisar = await Suscripcion.find({
    userId,
    $or: [
      { status: "authorized" },
      { status: "pending", createdAt: { $gt: new Date(Date.now() - PENDIENTE_MAX_MS) } },
    ],
  })
    .sort({ createdAt: -1 })
    .limit(5);
  await sincronizarVarias(aRevisar);
  return aRevisar.length;
};

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

  const resultado = await new PreApproval(getClient())
    .create({
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
    })
    .catch((error: unknown) => {
      // El SDK de MP tira objetos con status/message/cause: se loguean enteros
      // para poder ver el motivo real (el usuario solo ve un mensaje genérico).
      console.error(
        "[suscripcion/crear] Mercado Pago rechazó la creación:",
        JSON.stringify(error, Object.getOwnPropertyNames(error as object))
      );
      throw error;
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

export const obtenerEstadoSuscripcion = async (userId: string, reconciliarSiHaceFalta = true) => {
  const buscar = () => Suscripcion.find({ userId }).sort({ createdAt: -1 });
  const esVigente = (s: ISuscripcion) => Boolean(s.vigenteHasta) && s.vigenteHasta!.getTime() > Date.now() - GRACIA_MS;

  let suscripciones = await buscar();
  let vigente = suscripciones.find(esVigente);

  // Sin acceso vigente pero con una suscripción pendiente/autorizada: puede
  // que ya esté paga y no nos hayamos enterado. Se confirma contra MP.
  if (!vigente && reconciliarSiHaceFalta && (await reconciliar(userId)) > 0) {
    suscripciones = await buscar();
    vigente = suscripciones.find(esVigente);
  }

  const user = await User.findById(userId);
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

  await sincronizarVarias(abiertas);
  return obtenerEstadoSuscripcion(userId, false);
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

  return obtenerEstadoSuscripcion(userId, false);
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

  // Auto-sanación: una suscripción "authorized" vencida puede haberse renovado,
  // o una "pending" puede haberse pagado, sin que nos enterásemos (webhook
  // perdido o sin configurar). Se confirma contra MP antes de bloquear.
  if ((await reconciliar(userId)) > 0 && (await Suscripcion.exists(vigenteQuery(userId)))) {
    return { permitido: true, viaPrueba: false };
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
