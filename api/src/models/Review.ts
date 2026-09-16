import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  customerId: mongoose.Types.ObjectId;
  name: string;
  serviceId: mongoose.Types.ObjectId;
  serviceTitle: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true, trim: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    serviceTitle: { type: String, required: true, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true, trim: true },
    approved: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const Review = mongoose.model<IReview>("Review", reviewSchema);
