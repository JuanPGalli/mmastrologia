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
});

export const User = mongoose.model<IUser>("User", userSchema);
