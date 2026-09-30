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
  // Se completa solo (ver astroHandlers.ts) la primera vez que la persona
  // genera un informe en el Astrólogo Virtual, para que funciones que
  // necesitan la carta (como el horóscopo diario) no le vuelvan a pedir los
  // mismos datos de nacimiento.
  birthData: { type: birthDataSchema, required: false },
});

export const User = mongoose.model<IUser>("User", userSchema);