import { FilterQuery } from "mongoose";
import { IPost, IPostComment, Post } from "../models/Post";

type PostFilters = {
  q?: unknown;
  category?: unknown;
  tag?: unknown;
  includeUnpublished?: unknown;
  page?: unknown;
  limit?: unknown;
};

export const getAllPosts = async (filters: PostFilters = {}) => {
  const query: FilterQuery<IPost> = {};

  if (filters.includeUnpublished !== true && filters.includeUnpublished !== "true") {
    query.published = true;
  }

  if (typeof filters.category === "string" && filters.category.trim()) {
    query.category = filters.category.trim();
  }

  if (typeof filters.tag === "string" && filters.tag.trim()) {
    query.tags = filters.tag.trim();
  }

  if (typeof filters.q === "string" && filters.q.trim()) {
    query.$text = { $search: filters.q.trim() };
  }

  const page = Math.max(parseInt(String(filters.page ?? "1"), 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(String(filters.limit ?? "9"), 10) || 9, 1), 50);
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    Post.find(query)
      .select("-comments")
      .sort({ publishedAt: -1, order: 1 })
      .skip(skip)
      .limit(limit),
    Post.countDocuments(query),
  ]);

  return {
    posts,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
};

export const getPostBySlug = async (slug: string) => {
  const post = await Post.findOne({ slug, published: true });
  if (!post) throw new Error("Artículo no encontrado");
  return post;
};

export const getPostById = async (id: string) => {
  const post = await Post.findById(id);
  if (!post) throw new Error("Artículo no encontrado");
  return post;
};

export const createPost = async (payload: Partial<IPost>) => {
  const post = new Post(payload);
  return post.save();
};

export const updatePostById = async (id: string, payload: Partial<IPost>) => {
  const post = await Post.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!post) throw new Error("Artículo no encontrado");
  return post;
};

export const deletePostById = async (id: string) => {
  const post = await Post.findByIdAndDelete(id);
  if (!post) throw new Error("Artículo no encontrado");
  return post;
};

export const addCommentToPost = async (
  slug: string,
  payload: Pick<IPostComment, "name" | "email" | "text">
) => {
  const post = await Post.findOne({ slug, published: true });
  if (!post) throw new Error("Artículo no encontrado");

  if (!payload.name?.trim() || !payload.text?.trim()) {
    throw new Error("Nombre y comentario son obligatorios");
  }

  post.comments.push({
    name: payload.name.trim(),
    email: payload.email?.trim(),
    text: payload.text.trim(),
    approved: true,
    createdAt: new Date(),
  } as IPostComment);

  await post.save();
  return post;
};

export const deleteCommentFromPost = async (postId: string, commentId: string) => {
  const post = await Post.findById(postId);
  if (!post) throw new Error("Artículo no encontrado");

  const comment = post.comments.find((c) => String(c._id) === commentId);
  if (!comment) throw new Error("Comentario no encontrado");

  post.comments = post.comments.filter((c) => String(c._id) !== commentId) as typeof post.comments;
  await post.save();
  return post;
};
