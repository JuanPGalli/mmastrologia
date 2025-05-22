import {
  getAllProducts,
  getProductByName,
  createProduct,
  updateProductById,
  deleteProduct,
} from "../controllers/productControllers";
import { RequestHandler } from "express";
import { Product } from "../models/Products";

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
  const newProduct = new Product(req.body);
  try {
    await createProduct(newProduct);
    res.status(200).json(newProduct);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
export const updateProductHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { name, description, price, imageUrl, category, stock } = req.body;
  try {
    await updateProductById(
      id,
      name,
      description,
      price,
      imageUrl,
      category,
      stock
    );
    res.status(200).json(`The product ${name} was successfully updated`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
export const deleteProductHandler: RequestHandler = async () => {};
