import { RequestHandler } from "express";
import {
  addCommentToPost,
  createPost,
  deleteCommentFromPost,
  deletePostById,
  getAllPosts,
  getPostById,
  getPostBySlug,
  updatePostById,
} from "../controllers/postController";

const sendError = (res: Parameters<RequestHandler>[1], error: unknown) => {
  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(400).json({ error: "Unknown error" });
};

export const getPostsHandler: RequestHandler = async (req, res) => {
  try {
    const result = await getAllPosts(req.query);
    res.status(200).json(result);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getAdminPostsHandler: RequestHandler = async (req, res) => {
  try {
    const result = await getAllPosts({ ...req.query, includeUnpublished: true });
    res.status(200).json(result);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getPostBySlugHandler: RequestHandler = async (req, res) => {
  try {
    const post = await getPostBySlug(req.params.slug);
    res.status(200).json(post);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getPostByIdHandler: RequestHandler = async (req, res) => {
  try {
    const post = await getPostById(req.params.id);
    res.status(200).json(post);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const createPostHandler: RequestHandler = async (req, res) => {
  try {
    const post = await createPost(req.body);
    res.status(201).json(post);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const updatePostHandler: RequestHandler = async (req, res) => {
  try {
    const post = await updatePostById(req.params.id, req.body);
    res.status(200).json(post);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const deletePostHandler: RequestHandler = async (req, res) => {
  try {
    const post = await deletePostById(req.params.id);
    res.status(200).json({ message: "Artículo eliminado", post });
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const addCommentHandler: RequestHandler = async (req, res) => {
  try {
    const post = await addCommentToPost(req.params.slug, req.body);
    res.status(201).json(post);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const deleteCommentHandler: RequestHandler = async (req, res) => {
  try {
    const post = await deleteCommentFromPost(req.params.id, req.params.commentId);
    res.status(200).json(post);
  } catch (error: unknown) {
    sendError(res, error);
  }
};
