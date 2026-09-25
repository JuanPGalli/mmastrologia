import { Router } from "express";
import { postInformeHandler } from "../handlers/astroHandlers";
import { requireAuth } from "../middleware/auth";
import { astroLimiter } from "../middleware/rateLimiters";

const astroRouter = Router();

astroRouter.post("/informe", requireAuth, astroLimiter, postInformeHandler);

export default astroRouter;
