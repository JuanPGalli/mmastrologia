import { Router } from "express";
import {
  getAdminPaymentsHandler,
  getMyPaymentsHandler,
  getPaymentHandler,
  patchScheduleHandler,
  postPreferenceHandler,
  postWebhookHandler,
} from "../handlers/paymentHandlers";
import { optionalAuth, requireAdmin, requireAuth } from "../middleware/auth";
import { formLimiter } from "../middleware/rateLimiters";

const paymentRouter = Router();

paymentRouter.post("/preference", formLimiter, optionalAuth, postPreferenceHandler);
paymentRouter.get("/admin", requireAuth, requireAdmin, getAdminPaymentsHandler);
paymentRouter.get("/mine", requireAuth, getMyPaymentsHandler);
paymentRouter.get("/:reference", getPaymentHandler);
paymentRouter.patch("/:reference/schedule", patchScheduleHandler);
paymentRouter.post("/webhook", postWebhookHandler);

export default paymentRouter;
