import { registerUser, loginUser } from "../controllers/userController";
import { RequestHandler } from "express";
import { Product } from "../models/Products";

export const registerUserHandler: RequestHandler = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    await registerUser(name, email, password);
    res.status(201).json({ message: "Usuario registrado" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};

export const loginUserHandler: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  try {
    const { token, user } = await loginUser(email, password);
    res.json({ token, user });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: "Unknown error" });
    }
  }
};
