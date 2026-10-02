import mongoose, { Document, Schema } from "mongoose";

export interface IBirthData {
  year: number;
  month: number;
  day: number;
  hour?: number;
  minute?: number;
  horaDesconocida: boolean;
  latitude: number;
  longitude: number;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role?: string;
  googleId?: string;
  picture?: string;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  birthData?: IBirthData;
  // true recién cuando la primera interacción del Astrólogo Virtual
  // (informe, horóscopo o sinastría) termina EXITOSAMENTE sin tener una
  // suscripción activa — así no se "gasta" la prueba gratis si Gemini
  // falla o el formulario tenía un dato mal cargado.
  pruebaGratisUsada?: boolean;
}

const birthDataSchema = new Schema<IBirthData>(
  {
    year: { type: Number, required: true },
    month: { type: Number, required: true },
    day: { type: Number, required: true },
    hour: { type: Number },
    minute: { type: Number },
    horaDesconocida: { type: Boolean, required: true, default: false },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function (this: IUser) {
      return !this.googleId;
    },
  },
  role: { type: String, default: "user" },
  googleId: { type: String, index: true },
  picture: { type: String, trim: true },
  resetTokenHash: { type: String },
  resetTokenExpires: { type: Date },
  birthData: { type: birthDataSchema, required: false },
  pruebaGratisUsada: { type: Boolean, default: false },
});

export const User = mongoose.model<IUser>("User", userSchema);
