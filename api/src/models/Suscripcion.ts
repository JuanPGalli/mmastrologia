import mongoose, { Document, Schema } from "mongoose";

export type SuscripcionStatus = "pending" | "authorized" | "paused" | "cancelled";

export interface ISuscripcion extends Document {
  userId: mongoose.Types.ObjectId;
  mpPreapprovalId: string;
  status: SuscripcionStatus;
  monto: number;
  moneda: string;
  createdAt: Date;
  updatedAt: Date;
}

const suscripcionSchema = new Schema<ISuscripcion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mpPreapprovalId: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["pending", "authorized", "paused", "cancelled"],
      default: "pending",
    },
    monto: { type: Number, required: true },
    moneda: { type: String, required: true, default: "ARS" },
  },
  { timestamps: true }
);

export const Suscripcion = mongoose.model<ISuscripcion>("Suscripcion", suscripcionSchema);
