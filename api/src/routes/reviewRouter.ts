import { Router } from "express";
import {
  deleteReviewHandler,
  getAdminReviewsHandler,
  getReviewsHandler,
  patchReviewApprovalHandler,
  postReviewHandler,
} from "../handlers/reviewHandlers";
import { requireAdmin, requireAuth } from "../middleware/auth";

const reviewRouter = Router();

reviewRouter.get("/", getReviewsHandler);
reviewRouter.get("/admin", requireAuth, requireAdmin, getAdminReviewsHandler);
reviewRouter.post("/", requireAuth, postReviewHandler);
reviewRouter.patch("/:id/approval", requireAuth, requireAdmin, patchReviewApprovalHandler);
reviewRouter.delete("/:id", requireAuth, requireAdmin, deleteReviewHandler);

export default reviewRouter;
