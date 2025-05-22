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
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
export const createProductHandler: RequestHandler = async () => {};
export const editProductHandler: RequestHandler = async () => {};
export const deleteProductHandler: RequestHandler = async () => {};
