import {
  loginUser,
  loginWithGoogle,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from "../controllers/userController";
import { RequestHandler } from "express";

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

export const forgotPasswordHandler: RequestHandler = async (req, res) => {
  const { email } = req.body;

  try {
    await requestPasswordReset(email);
  } catch (error: unknown) {
    console.error("Error en forgot-password:", error);
    // No devolvemos el error real al cliente para no revelar información.
  }

  // Siempre respondemos igual, exista o no el email (evita enumeración).
  res.status(200).json({
    message: "Si el email está registrado, vas a recibir un link para restablecer tu contraseña.",
  });
};

export const resetPasswordHandler: RequestHandler = async (req, res) => {
  const { email, token, password } = req.body;

  try {
    await resetPassword(email, token, password);
    res.status(200).json({ message: "Contraseña actualizada." });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo actualizar la contraseña.";
    res.status(400).json({ error: message });
  }
};

export const googleLoginHandler: RequestHandler = async (req, res) => {
  const { idToken } = req.body;

  try {
    const result = await loginWithGoogle(idToken);
    res.status(200).json(result);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "No se pudo iniciar sesión con Google.";
    res.status(400).json({ error: message });
  }
};
