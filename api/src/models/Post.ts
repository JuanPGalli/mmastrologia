import mongoose, { Document, Schema } from "mongoose";

export interface IPostComment {
  _id?: mongoose.Types.ObjectId;
  name: string;
  email?: string;
  text: string;
  approved: boolean;
  createdAt: Date;
}

export interface IPostSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface IPost extends Document {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  category?: string;
  tags: string[];
  author: string;
  seo?: IPostSeo;
  comments: IPostComment[];
  published: boolean;
  publishedAt?: Date;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const postCommentSchema = new Schema<IPostComment>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    text: { type: String, required: true, trim: true },
    approved: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const postSeoSchema = new Schema<IPostSeo>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
  },
  { _id: false }
);

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    excerpt: { type: String, trim: true },
    content: { type: String, required: true },
    image: { type: String, trim: true },
    category: { type: String, trim: true },
    tags: [{ type: String, trim: true }],
    author: { type: String, trim: true, default: "María Marta Galli" },
    seo: postSeoSchema,
    comments: { type: [postCommentSchema], default: [] },
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

postSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });

export const Post = mongoose.model<IPost>("Post", postSchema);
