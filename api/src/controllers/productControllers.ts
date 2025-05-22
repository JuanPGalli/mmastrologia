import { Product } from "../models/Products";

export const getAllProducts: Function = () => {};
export const getProductByName: Function = () => {};

export const createProduct: Function = async (newProduct: any) => {
  const savedProduct = await newProduct.save();
  return savedProduct;
};

export const updateProductById: Function = async (
  id: string,
  updatedProduct: any
) => {
  const updated = await Product.findByIdAndUpdate(id, updatedProduct);
};
export const deleteProduct: Function = async (id: string) => {
  const deleted = await Product.findByIdAndDelete(id);
  if (!deleted) throw new Error("Product not found");
};
