import mongoose, { Document, Schema } from "mongoose";

export type TipoConsulta = "informe" | "sinastria";

// Una consulta completa del Astrólogo Virtual (informe + horóscopo + carta,
// o una sinastría), guardada tal cual se le mostró a la persona. Sirve para:
// 1) mostrar el último resultado al volver a la página (en cualquier
//    dispositivo, no solo en el navegador donde se generó),
// 2) hacer cumplir el límite de 1 consulta por tipo por día.
export interface IConsultaAstro extends Document {
  userId: mongoose.Types.ObjectId;
  tipo: TipoConsulta;
  fecha: string; // YYYY-MM-DD, huso horario Argentina
  entrada: Record<string, unknown>;
  resultado: Record<string, unknown>;
  createdAt: Date;
}

const consultaAstroSchema = new Schema<IConsultaAstro>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tipo: { type: String, enum: ["informe", "sinastria"], required: true },
    fecha: { type: String, required: true },
    entrada: { type: Schema.Types.Mixed, default: {} },
    resultado: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

consultaAstroSchema.index({ userId: 1, tipo: 1, createdAt: -1 });
consultaAstroSchema.index({ userId: 1, tipo: 1, fecha: 1 });

export const ConsultaAstro = mongoose.model<IConsultaAstro>("ConsultaAstro", consultaAstroSchema);
