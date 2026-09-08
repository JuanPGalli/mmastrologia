import { RequestHandler } from "express";
import { paramValue } from "../utils/params";
import {
  createPaymentPreference,
  getAllPaymentsAdmin,
  getPaymentByReference,
  processPaymentWebhook,
} from "../controllers/paymentController";

export const getAdminPaymentsHandler: RequestHandler = async (_req, res) => {
  try {
    const payments = await getAllPaymentsAdmin();
    res.status(200).json(payments);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudieron obtener los pagos.";
    res.status(400).json({ error: message });
  }
};

export const postPreferenceHandler: RequestHandler = async (req, res) => {
  try {
    const result = await createPaymentPreference(req.body);
    res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar el pago.";
    res.status(400).json({ error: message });
  }
};

export const getPaymentHandler: RequestHandler = async (req, res) => {
  try {
    const payment = await getPaymentByReference(paramValue(req.params.reference));
    res.status(200).json(payment);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Pago no encontrado.";
    res.status(404).json({ error: message });
  }
};

export const postWebhookHandler: RequestHandler = async (req, res) => {
  // Mercado Pago espera un 200 rápido; procesamos y respondemos siempre OK
  // para que no reintente indefinidamente, salvo error real de nuestro lado.
  try {
    await processPaymentWebhook({ ...req.query, ...req.body });
    res.status(200).send("ok");
  } catch (error: unknown) {
    console.error("Error procesando webhook de Mercado Pago:", error);
    res.status(200).send("ok");
  }
};
