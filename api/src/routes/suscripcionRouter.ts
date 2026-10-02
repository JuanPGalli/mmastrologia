import { Router } from "express";
import { postCrearSuscripcionHandler, getEstadoSuscripcionHandler } from "../handlers/suscripcionHandlers";
import { requireAuth } from "../middleware/auth";
import { formLimiter } from "../middleware/rateLimiters";

const suscripcionRouter = Router();

suscripcionRouter.post("/crear", requireAuth, formLimiter, postCrearSuscripcionHandler);
suscripcionRouter.get("/estado", requireAuth, getEstadoSuscripcionHandler);

export default suscripcionRouter;
