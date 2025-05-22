import {
  getAllProducts,
  getProductByName,
  getProductById,
  createProduct,
  updateProductById,
  deleteProduct,
} from "../controllers/productControllers";
import { RequestHandler } from "express";
import { Product } from "../models/Products";

export const getProductHandler: RequestHandler = async (req, res) => {
  const { name } = req.query;
  const result = name ? await getProductByName(name) : await getAllProducts();
  try {
    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
export const getProductByIdHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await getProductById(id);
    res.status(200).json(response);
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
  const updatedProduct = req.body;
  try {
    await updateProductById(id, updatedProduct);
    res.status(200).json(`The product was successfully updated`);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
export const deleteProductHandler: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    await deleteProduct(id);
    res.status(200).json("driver deleted successfully");
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
