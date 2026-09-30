import mongoose, { Document, Schema } from "mongoose";

// Se cachea un horóscopo por usuario por día (fecha en huso horario
// Argentina, ver astroController.ts) para no volver a llamar a Gemini si la
// persona entra varias veces el mismo día — importante tanto para el costo
// como para no pisar los límites de rate del free tier de Google.
export interface IHoroscopoDiario extends Document {
  userId: mongoose.Types.ObjectId;
  fecha: string; // YYYY-MM-DD, huso horario Argentina
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
