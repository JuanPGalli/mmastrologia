import mongoose, { Schema, Document } from "mongoose";

/**
 * Interfaz TypeScript para tipar un Producto.
 * Esto es útil para que el IDE sugiera propiedades y para prevenir errores.
 */

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Defino el esquema de Mongoose.
 * Es cómo se verá el documento en MongoDB.
 */
const productSchema: Schema<IProduct> = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    imageUrl: { type: String },
    category: { type: String },
    stock: { type: Number, default: 0 },
  },
  {
    timestamps: true, // agrega createdAt y updatedAt automáticamente
  }
);

/**
 * Exportamos el modelo Product, que puede usarse en controllers, handlers, etc.
 */
export const Product = mongoose.model<IProduct>("Product", productSchema);
