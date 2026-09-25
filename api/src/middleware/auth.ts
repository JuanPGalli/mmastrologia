import { NextFunction, Request, RequestHandler, Response } from "express";
import { verifyToken } from "../utils/jwt";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const requireAuth: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    res.status(401).json({ error: "Token invalido" });
  }
};

export const requireAdmin: RequestHandler = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({ error: "Permisos de administrador requeridos" });
    return;
  }

  next();
};

// Para endpoints públicos que además quieren saber (sin exigirlo) si quien
// llama está logueado — por ejemplo, para vincular un pago a su cuenta.
export const optionalAuth: RequestHandler = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (token) {
    try {
      const payload = verifyToken(token);
      req.user = { id: payload.id, role: payload.role };
    } catch {
      // Token inválido: seguimos como invitado, sin cortar la request.
    }
  }

  next();
};