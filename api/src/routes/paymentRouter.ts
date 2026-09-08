import { Router } from "express";
import {
  getAdminPaymentsHandler,
  getPaymentHandler,
  postPreferenceHandler,
  postWebhookHandler,
} from "../handlers/paymentHandlers";
import { requireAdmin, requireAuth } from "../middleware/auth";
import { formLimiter } from "../middleware/rateLimiters";

const paymentRouter = Router();

paymentRouter.post("/preference", formLimiter, postPreferenceHandler);
paymentRouter.get("/admin", requireAuth, requireAdmin, getAdminPaymentsHandler);
paymentRouter.get("/:reference", getPaymentHandler);
paymentRouter.post("/webhook", postWebhookHandler);

export default paymentRouter;
