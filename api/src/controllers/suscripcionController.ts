import { MercadoPagoConfig, PreApproval } from "mercadopago";
import { Suscripcion } from "../models/Suscripcion";
import { User } from "../models/User";
import { ValidationError } from "../utils/errors";

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

export const crearSuscripcion = async (userId: string, email: string) => {
  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error("FRONTEND_URL no está configurada.");
  }

  const monto = obtenerPrecioMensual();
  const client = getClient();
  const preapproval = new PreApproval(client);

  const resultado = await preapproval.create({
    body: {
      reason: "Astrólogo Virtual — suscripción mensual (María Marta Galli)",
      external_reference: userId,
      payer_email: email,
      back_url: `${frontendUrl.replace(/\/$/, "")}/astrologo-virtual?suscripcion=ok`,
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
  });

  return { initPoint: resultado.init_point };
};

export const obtenerEstadoSuscripcion = async (userId: string) => {
  const suscripcion = await Suscripcion.findOne({ userId }).sort({ createdAt: -1 });
  const user = await User.findById(userId);

  return {
    activa: suscripcion?.status === "authorized",
    status: suscripcion?.status ?? null,
    pruebaGratisUsada: Boolean(user?.pruebaGratisUsada),
  };
};

export const procesarWebhookPreapproval = async (preapprovalId: string) => {
  const client = getClient();
  const preapproval = new PreApproval(client);
  const detalle = await preapproval.get({ id: preapprovalId });

  const suscripcion = await Suscripcion.findOne({ mpPreapprovalId: preapprovalId });
  if (!suscripcion) return;

  suscripcion.status = (detalle.status as typeof suscripcion.status) ?? suscripcion.status;
  await suscripcion.save();
};

export const tieneAccesoVigente = async (
  userId: string
): Promise<{ permitido: boolean; viaPrueba: boolean }> => {
  const suscripcionActiva = await Suscripcion.exists({ userId, status: "authorized" });
  if (suscripcionActiva) return { permitido: true, viaPrueba: false };

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
