import { Router } from "express";
import {
  addCommentHandler,
  createPostHandler,
  deleteCommentHandler,
  deletePostHandler,
  getAdminPostsHandler,
  getPostByIdHandler,
  getPostBySlugHandler,
  getPostsHandler,
  updatePostHandler,
} from "../handlers/postHandlers";
import { requireAdmin, requireAuth } from "../middleware/auth";

const postRouter = Router();

postRouter.get("/", getPostsHandler);
postRouter.get("/admin", requireAuth, requireAdmin, getAdminPostsHandler);
postRouter.get("/admin/:id", requireAuth, requireAdmin, getPostByIdHandler);
postRouter.get("/:slug", getPostBySlugHandler);
postRouter.post("/", requireAuth, requireAdmin, createPostHandler);
postRouter.put("/:id", requireAuth, requireAdmin, updatePostHandler);
postRouter.delete("/:id", requireAuth, requireAdmin, deletePostHandler);

postRouter.post("/:slug/comments", addCommentHandler);
postRouter.delete("/:id/comments/:commentId", requireAuth, requireAdmin, deleteCommentHandler);

export default postRouter;
