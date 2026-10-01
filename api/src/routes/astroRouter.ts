import { Router } from "express";
import { postInformeHandler, getHoroscopoDiarioHandler, postSinastriaHandler } from "../handlers/astroHandlers";
import { requireAuth } from "../middleware/auth";
import { astroLimiter } from "../middleware/rateLimiters";

const astroRouter = Router();

astroRouter.post("/informe", requireAuth, astroLimiter, postInformeHandler);
astroRouter.get("/horoscopo-diario", requireAuth, astroLimiter, getHoroscopoDiarioHandler);
astroRouter.post("/sinastria", requireAuth, astroLimiter, postSinastriaHandler);

export default astroRouter;
