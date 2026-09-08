import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";
import { IPayment, Payment } from "../models/Payment";
import { Service } from "../models/Service";

const getClient = () => {
  if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error("MP_ACCESS_TOKEN no está configurada.");
  }
  return new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
};

type PreferencePayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  serviceId?: unknown;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const createPaymentPreference = async (payload: PreferencePayload) => {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const serviceId = typeof payload.serviceId === "string" ? payload.serviceId.trim() : "";

  if (!name || !email) {
    throw new Error("Faltan nombre y email.");
  }
  if (!emailRegex.test(email)) {
    throw new Error("El email ingresado no es válido.");
  }
  if (!serviceId) {
    throw new Error("Falta indicar qué consulta se está reservando.");
  }

  // El precio SIEMPRE se busca en el servidor a partir del servicio elegido,
  // nunca se confía en un monto que venga del navegador.
  const service = await Service.findById(serviceId);
  if (!service || !service.active) {
    throw new Error("La consulta seleccionada no está disponible.");
  }
  if (!service.price || service.price <= 0) {
    throw new Error("Esta consulta todavía no tiene un precio configurado.");
  }

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) {
    throw new Error("FRONTEND_URL no está configurada.");
  }

  const payment = await Payment.create({
    name,
    email,
    phone: phone || undefined,
    serviceId: service._id,
    serviceTitle: service.title,
    amount: service.price,
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
          id: String(service._id),
          title: `${service.title} — María Marta Galli`,
          quantity: 1,
          unit_price: service.price,
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

  const service = await Service.findById(payment.serviceId);

  // Solo devolvemos lo necesario para la página de éxito, nada más.
  return {
    name: payment.name,
    email: payment.email,
    status: payment.status,
    serviceTitle: payment.serviceTitle,
    calendlyUrl: service?.calendlyUrl || undefined,
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
