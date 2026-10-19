import { Router } from "express";
import {
  getEstadoSuscripcionHandler,
  postCancelarSuscripcionHandler,
  postCrearSuscripcionHandler,
  postSincronizarSuscripcionHandler,
} from "../handlers/suscripcionHandlers";
import { requireAuth } from "../middleware/auth";
import { formLimiter } from "../middleware/rateLimiters";

const suscripcionRouter = Router();

suscripcionRouter.post("/crear", requireAuth, formLimiter, postCrearSuscripcionHandler);
suscripcionRouter.get("/estado", requireAuth, getEstadoSuscripcionHandler);
suscripcionRouter.post("/sincronizar", requireAuth, formLimiter, postSincronizarSuscripcionHandler);
suscripcionRouter.post("/cancelar", requireAuth, formLimiter, postCancelarSuscripcionHandler);

export default suscripcionRouter;
