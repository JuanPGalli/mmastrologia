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
export const createProductHandler: RequestHandler = async (req, res) => {
  const { name, description, price, imageUrl, category, stock } = req.body;
  try {
    await createProduct(name, description, price, imageUrl, category, stock);
    res.status(200).json(`The product ${name} was successfully created`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
export const editProductHandler: RequestHandler = async () => {};
export const deleteProductHandler: RequestHandler = async () => {};
