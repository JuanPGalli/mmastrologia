import mongoose, { Document, Schema } from "mongoose";

export type SuscripcionStatus = "pending" | "authorized" | "paused" | "cancelled";

export interface ISuscripcion extends Document {
  userId: mongoose.Types.ObjectId;
  mpPreapprovalId: string;
  status: SuscripcionStatus;
  monto: number;
  moneda: string;
  // Email que se le pasó a Mercado Pago como payer_email. En suscripciones
  // sin plan asociado MP rechaza el pago si el email de la cuenta con la que
  // se paga no coincide con este.
  payerEmail?: string;
  // Hasta cuándo está pago el período vigente (next_payment_date de MP en la
  // última sincronización "authorized"). Define el acceso: una suscripción
  // cancelada sigue dando acceso hasta esta fecha, porque ya se pagó.
  vigenteHasta?: Date;
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
    payerEmail: { type: String },
    vigenteHasta: { type: Date },
  },
  { timestamps: true }
);

export const Suscripcion = mongoose.model<ISuscripcion>("Suscripcion", suscripcionSchema);
