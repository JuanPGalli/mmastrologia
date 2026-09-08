import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";
import { IPayment, Payment } from "../models/Payment";

const getClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN no está configurada.");
  }
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
};

const CONSULTA_PRICE_ARS = Number(process.env.CONSULTA_PRICE_ARS || 95000);

type PreferencePayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createPaymentPreference = async (payload: PreferencePayload) => {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";

  if (!name || !email) {
    throw new Error("Faltan nombre y email.");
  }
  if (!emailRegex.test(email)) {
    throw new Error("El email ingresado no es válido.");
  }

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error("FRONTEND_URL no está configurada.");
  }

  const payment = await Payment.create({
    name,
    email,
    phone: phone || undefined,
    amount: CONSULTA_PRICE_ARS,
    currency: "ARS",
    status: "pending",
  });

  const client = getClient();
  const preference = new Preference(client);

  const backUrl = (status: string) =>
    `${frontendUrl.replace(/\/$/, "")}/agendar?status=${status}&ref=${payment._id}`;

  const result = await preference.create({
    body: {
      items: [
        {
          id: "consulta-astrologica",
          title: "Consulta astrológica — María Marta Galli",
          quantity: 1,
          unit_price: CONSULTA_PRICE_ARS,
          currency_id: "ARS",
        },
      ],
      payer: { name, email },
      external_reference: String(payment._id),
      back_urls: {
        success: backUrl("approved"),
        failure: backUrl("failure"),
        pending: backUrl("pending"),
      },
      auto_return: "approved",
      notification_url: process.env.MP_WEBHOOK_URL,
    },
  });

  payment.mpPreferenceId = result.id || undefined;
  await payment.save();

  return { initPoint: result.init_point, reference: String(payment._id) };
};

export const getPaymentByReference = async (reference: string) => {
  const payment = await Payment.findById(reference);
  if (!payment) throw new Error("Pago no encontrado");

  // Solo devolvemos lo necesario para prellenar Calendly, nada más.
  return {
    name: payment.name,
    email: payment.email,
    status: payment.status,
  };
};

export const getAllPaymentsAdmin = async () => {
  return Payment.find().sort({ createdAt: -1 });
};

const mapMpStatus = (status: string | undefined): IPayment["status"] => {
  if (status === "approved") return "approved";
  if (status === "rejected") return "rejected";
  if (status === "cancelled") return "cancelled";
  return "pending";
};

export const processPaymentWebhook = async (query: Record<string, unknown>) => {
  const type = (query.type || query.topic) as string | undefined;
  const paymentId = (query["data.id"] || query.id) as string | undefined;

  if (type !== "payment" || !paymentId) {
    // Otras notificaciones (merchant_order, etc.) las ignoramos.
    return;
  }

  const client = getClient();
  const mpPayment = new MPPayment(client);
  const details = await mpPayment.get({ id: paymentId });

  const reference = details.external_reference;
  if (!reference) return;

  const payment = await Payment.findById(reference);
  if (!payment) return;

  payment.status = mapMpStatus(details.status);
  payment.mpPaymentId = String(details.id);
  await payment.save();
};
