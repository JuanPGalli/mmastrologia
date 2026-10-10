import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role?: string;
  googleId?: string;
  picture?: string;
  resetTokenHash?: string;
  resetTokenExpires?: Date;
  // true recién cuando la primera interacción del Astrólogo Virtual
  // (informe, horóscopo o sinastría) termina EXITOSAMENTE sin tener una
  // suscripción activa — así no se "gasta" la prueba gratis si Gemini
  // falla o el formulario tenía un dato mal cargado.
  pruebaGratisUsada?: boolean;
}

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
  pruebaGratisUsada: { type: Boolean, default: false },
});

export const User = mongoose.model<IUser>("User", userSchema);