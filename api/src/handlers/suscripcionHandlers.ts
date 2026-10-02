import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { User } from "../models/User";
import { crearSuscripcion, obtenerEstadoSuscripcion } from "../controllers/suscripcionController";

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
    const resultado = await crearSuscripcion(req.user.id, user.email);
    res.status(200).json(resultado);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No pudimos crear la suscripción.";
    console.error("[suscripcion/crear] error:", error);
    res.status(502).json({ error: message });
  }
};

export const getEstadoSuscripcionHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const estado = await obtenerEstadoSuscripcion(req.user.id);
    res.status(200).json(estado);
  } catch (error: unknown) {
    console.error("[suscripcion/estado] error:", error);
    res.status(502).json({ error: "No pudimos consultar el estado de tu suscripción." });
  }
};
