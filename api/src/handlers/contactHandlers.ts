import { RequestHandler } from "express";
import { submitContactMessage } from "../controllers/contactController";

export const postContactHandler: RequestHandler = async (req, res) => {
  try {
    await submitContactMessage(req.body);
    res.status(200).json({ ok: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo enviar el mensaje.";
    res.status(400).json({ error: message });
  }
};
