import { Router } from "express";
import { postInformeHandler, postSinastriaHandler, getUltimaConsultaHandler } from "../handlers/astroHandlers";
import { requireAuth } from "../middleware/auth";
import { requireSuscripcionOPrueba } from "../middleware/suscripcion";
import { astroLimiter } from "../middleware/rateLimiters";

const astroRouter = Router();

// Ver el último resultado: solo login (sin gating de suscripción).
astroRouter.get("/ultimo", requireAuth, getUltimaConsultaHandler);

// Generar: login + límite de rate + suscripción activa o prueba gratis.
astroRouter.post("/informe", requireAuth, astroLimiter, requireSuscripcionOPrueba, postInformeHandler);
astroRouter.post("/sinastria", requireAuth, astroLimiter, requireSuscripcionOPrueba, postSinastriaHandler);

export default astroRouter;
