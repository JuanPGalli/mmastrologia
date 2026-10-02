import { RequestHandler } from "express";
import { AuthRequest } from "./auth";
import { tieneAccesoVigente } from "../controllers/suscripcionController";

export interface RequestConAcceso extends AuthRequest {
  accesoViaPrueba?: boolean;
}

export const requireSuscripcionOPrueba: RequestHandler = async (req: RequestConAcceso, res, next) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const acceso = await tieneAccesoVigente(req.user.id);
    if (!acceso.permitido) {
      res.status(402).json({
        error: "Ya usaste tu consulta de prueba gratis. Suscribite para seguir usando el Astrólogo Virtual.",
        requiereSuscripcion: true,
      });
      return;
    }
    req.accesoViaPrueba = acceso.viaPrueba;
    next();
  } catch (error) {
    console.error("[requireSuscripcionOPrueba] error:", error);
    res.status(502).json({ error: "No pudimos verificar tu acceso en este momento." });
  }
};
