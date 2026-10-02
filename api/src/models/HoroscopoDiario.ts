import mongoose, { Document, Schema } from "mongoose";

export interface IHoroscopoDiario extends Document {
  userId: mongoose.Types.ObjectId;
  fecha: string;
  titulo: string;
  texto: string;
  disclaimer: string;
  createdAt: Date;
}

const horoscopoDiarioSchema = new Schema<IHoroscopoDiario>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  fecha: { type: String, required: true },
  titulo: { type: String, required: true },
  texto: { type: String, required: true },
  disclaimer: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

horoscopoDiarioSchema.index({ userId: 1, fecha: 1 }, { unique: true });

export const HoroscopoDiario = mongoose.model<IHoroscopoDiario>(
  "HoroscopoDiario",
  horoscopoDiarioSchema
);
