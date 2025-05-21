import {
  getAllProducts,
  getProductByName,
  createProduct,
  editProductById,
  deleteProduct,
} from "../controllers/productControllers";
import { RequestHandler } from "express";

export const getProductHandler: RequestHandler = async (req, res) => {
  try {
    res.status(200).json("Hello World!");
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
export const createProductHandler: RequestHandler = async () => {};
export const editProductHandler: RequestHandler = async () => {};
export const deleteProductHandler: RequestHandler = async () => {};
