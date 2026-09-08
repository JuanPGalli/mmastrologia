import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface IPayment extends Document {
  name: string;
  email: string;
  phone?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  mpPreferenceId?: string;
  mpPaymentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: "ARS" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    mpPreferenceId: { type: String, trim: true, index: true },
    mpPaymentId: { type: String, trim: true, index: true },
  },
  { timestamps: true }
);

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);
