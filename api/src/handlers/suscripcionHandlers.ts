import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import {
  cancelarSuscripcion,
  crearSuscripcion,
  obtenerEstadoSuscripcion,
  sincronizarSuscripcionesDelUsuario,
} from "../controllers/suscripcionController";
import { ConflictError, ValidationError } from "../utils/errors";

const responderError = (res: Parameters<RequestHandler>[1], error: unknown, contexto: string, generico: string) => {
  if (error instanceof ValidationError) {
    res.status(400).json({ error: error.message });
    return;
  }
  if (error instanceof ConflictError) {
    res.status(409).json({ error: error.message });
    return;
  }
  // El detalle (token faltante, error de Mercado Pago, etc.) queda en los
  // logs del servidor; a la persona se le muestra un mensaje genérico.
  console.error(`[${contexto}] error:`, error);
  res.status(502).json({ error: generico });
};

export const postCrearSuscripcionHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado." });
      return;
    }
    const payerEmail = typeof req.body?.payerEmail === "string" ? req.body.payerEmail : undefined;
    const resultado = await crearSuscripcion(req.user.id, user.email, payerEmail);
    res.status(200).json(resultado);
  } catch (error: unknown) {
    responderError(res, error, "suscripcion/crear", "No pudimos iniciar la suscripción. Probá de nuevo en unos minutos.");
  }
};

export const getEstadoSuscripcionHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    res.status(200).json(await obtenerEstadoSuscripcion(req.user.id));
  } catch (error: unknown) {
    responderError(res, error, "suscripcion/estado", "No pudimos consultar el estado de tu suscripción.");
  }
};

export const postSincronizarSuscripcionHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    res.status(200).json(await sincronizarSuscripcionesDelUsuario(req.user.id));
  } catch (error: unknown) {
    responderError(res, error, "suscripcion/sincronizar", "No pudimos confirmar tu suscripción. Probá de nuevo en un momento.");
  }
};

export const postCancelarSuscripcionHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    res.status(200).json(await cancelarSuscripcion(req.user.id));
  } catch (error: unknown) {
    responderError(res, error, "suscripcion/cancelar", "No pudimos cancelar la suscripción. Probá de nuevo o escribinos por WhatsApp.");
  }
};
