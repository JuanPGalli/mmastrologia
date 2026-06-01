import mongoose, { Document, Schema } from "mongoose";

export interface IServiceReview {
  author: string;
  text: string;
  rating?: number;
}

export interface IServiceSeo {
  title?: string;
  description?: string;
  keywords?: string[];
}

export interface IService extends Document {
  title: string;
  subtitle?: string;
  slug: string;
  description: string;
  image?: string;
  category?: string;
  includes: string[];
  duration?: string;
  modality?: string;
  price?: number;
  ctaLabel?: string;
  ctaUrl?: string;
  videoUrl?: string;
  seo?: IServiceSeo;
  reviews: IServiceReview[];
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const serviceReviewSchema = new Schema<IServiceReview>(
  {
    author: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const serviceSeoSchema = new Schema<IServiceSeo>(
  {
    title: { type: String, trim: true },
    description: { type: String, trim: true },
    keywords: [{ type: String, trim: true }],
  },
  { _id: false }
);

const serviceSchema = new Schema<IService>(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    category: { type: String, trim: true },
    includes: [{ type: String, trim: true }],
    duration: { type: String, trim: true },
    modality: { type: String, trim: true },
    price: { type: Number, min: 0 },
    ctaLabel: { type: String, trim: true },
    ctaUrl: { type: String, trim: true },
    videoUrl: { type: String, trim: true },
    seo: serviceSeoSchema,
    reviews: { type: [serviceReviewSchema], default: [] },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

serviceSchema.index({ title: "text", subtitle: "text", description: "text" });

export const Service = mongoose.model<IService>("Service", serviceSchema);
