import { Router } from "express";
import { postInformeHandler, getHoroscopoDiarioHandler } from "../handlers/astroHandlers";
import { requireAuth } from "../middleware/auth";
import { astroLimiter } from "../middleware/rateLimiters";

const astroRouter = Router();

astroRouter.post("/informe", requireAuth, astroLimiter, postInformeHandler);
astroRouter.get("/horoscopo-diario", requireAuth, astroLimiter, getHoroscopoDiarioHandler);

export default astroRouter;
