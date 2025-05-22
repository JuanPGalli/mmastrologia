import { Product } from "../models/Products";

export const getAllProducts: Function = async () => {
  const products = await Product.find();
  return products;
};
export const getProductByName: Function = async (name: any) => {
  if (!name || typeof name !== "string")
    throw new Error("Falta el parámetro name");
  const regex = new RegExp(name, "i"); // 'i' = case-insensitive
  const products = await Product.find({ name: regex });
  return products;
};
export const getProductById: Function = async (id: string) => {
  const product = await Product.findById(id);
  if (!product) throw new Error("Producto no encontrado");
};

export const createProduct: Function = async (newProduct: any) => {
  const savedProduct = await newProduct.save();
  return savedProduct;
};

export const updateProductById: Function = async (
  id: string,
  updatedProduct: any
) => {
  const updated = await Product.findByIdAndUpdate(id, updatedProduct);
  if (!updated) throw new Error("Product not found");
};
export const deleteProduct: Function = async (id: string) => {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new Error("Product not found");
};
