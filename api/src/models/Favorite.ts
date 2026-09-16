import mongoose, { Document, Schema } from "mongoose";

export type FavoriteItemType = "service" | "post";

export interface IFavorite extends Document {
  customerId: mongoose.Types.ObjectId;
  itemType: FavoriteItemType;
  itemId: mongoose.Types.ObjectId;
  itemTitle: string;
  itemSlug: string;
  createdAt: Date;
}

const favoriteSchema = new Schema<IFavorite>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemType: { type: String, enum: ["service", "post"], required: true },
    itemId: { type: Schema.Types.ObjectId, required: true },
    itemTitle: { type: String, required: true, trim: true },
    itemSlug: { type: String, required: true, trim: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

favoriteSchema.index({ customerId: 1, itemType: 1, itemId: 1 }, { unique: true });

export const Favorite = mongoose.model<IFavorite>("Favorite", favoriteSchema);
