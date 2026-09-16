import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { paramValue } from "../utils/params";
import {
  createReview,
  deleteReview,
  getAllReviewsAdmin,
  getApprovedReviews,
  setReviewApproval,
} from "../controllers/reviewController";

const sendError = (res: Parameters<RequestHandler>[1], error: unknown) => {
  const message = error instanceof Error ? error.message : "Error inesperado.";
  res.status(400).json({ error: message });
};

export const getReviewsHandler: RequestHandler = async (_req, res) => {
  try {
    const reviews = await getApprovedReviews();
    res.status(200).json(reviews);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getAdminReviewsHandler: RequestHandler = async (_req, res) => {
  try {
    const reviews = await getAllReviewsAdmin();
    res.status(200).json(reviews);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const postReviewHandler: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Necesitás iniciar sesión." });
      return;
    }
    const review = await createReview(req.user.id, req.body);
    res.status(201).json(review);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const patchReviewApprovalHandler: RequestHandler = async (req, res) => {
  try {
    const review = await setReviewApproval(paramValue(req.params.id), Boolean(req.body.approved));
    res.status(200).json(review);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const deleteReviewHandler: RequestHandler = async (req, res) => {
  try {
    await deleteReview(paramValue(req.params.id));
    res.status(200).json({ message: "Reseña eliminada." });
  } catch (error: unknown) {
    sendError(res, error);
  }
};
