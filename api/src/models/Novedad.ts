import mongoose, { Document, Schema } from "mongoose";

export interface INovedad extends Document {
  title: string;
  description: string;
  image?: string;
  location?: string;
  startDate?: Date;
  endDate?: Date;
  instagramUrl?: string;
  ctaText?: string;
  ctaLink?: string;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const novedadSchema = new Schema<INovedad>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    image: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date },
    endDate: { type: Date },
    instagramUrl: { type: String, trim: true },
    ctaText: { type: String, trim: true },
    ctaLink: { type: String, trim: true },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Novedad = mongoose.model<INovedad>("Novedad", novedadSchema);
