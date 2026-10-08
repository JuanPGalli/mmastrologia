import { Router } from "express";
import {
  postInformeHandler,
  getHoroscopoDiarioHandler,
  postSinastriaHandler,
} from "../handlers/astroHandlers";
import { requireAuth } from "../middleware/auth";
import { requireSuscripcionOPrueba } from "../middleware/suscripcion";
import { astroLimiter } from "../middleware/rateLimiters";

const astroRouter = Router();

astroRouter.post("/informe", requireAuth, astroLimiter, requireSuscripcionOPrueba, postInformeHandler);
astroRouter.get(
  "/horoscopo-diario",
  requireAuth,
  astroLimiter,
  requireSuscripcionOPrueba,
  getHoroscopoDiarioHandler
);
astroRouter.post("/sinastria", requireAuth, astroLimiter, requireSuscripcionOPrueba, postSinastriaHandler);

export default astroRouter;