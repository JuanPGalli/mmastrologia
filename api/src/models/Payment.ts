import mongoose, { Document, Schema } from "mongoose";

export type PaymentStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface IPayment extends Document {
  name: string;
  email: string;
  phone?: string;
  customerId?: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  serviceTitle: string;
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
    // Opcional: si quien paga estaba logueada, queda vinculado a su cuenta
    // para su historial en "Mi cuenta". Si es invitada, queda sin definir.
    customerId: { type: Schema.Types.ObjectId, ref: "User" },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    // Copiamos el título al momento del pago: si el servicio se renombra o
    // borra después, el historial de pagos sigue siendo legible.
    serviceTitle: { type: String, required: true, trim: true },
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
