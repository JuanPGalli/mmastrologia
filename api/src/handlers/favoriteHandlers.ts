import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { paramValue } from "../utils/params";
import { addFavorite, getMyFavorites, removeFavorite } from "../controllers/favoriteController";

const sendError = (res: Parameters<RequestHandler>[1], error: unknown) => {
  const message = error instanceof Error ? error.message : "Error inesperado.";
  res.status(400).json({ error: message });
};

export const getMyFavoritesHandler: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Necesitás iniciar sesión." });
      return;
    }
    const favorites = await getMyFavorites(req.user.id);
    res.status(200).json(favorites);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const postFavoriteHandler: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Necesitás iniciar sesión." });
      return;
    }
    const favorite = await addFavorite(req.user.id, req.body);
    res.status(201).json(favorite);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const deleteFavoriteHandler: RequestHandler = async (req: AuthRequest, res) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Necesitás iniciar sesión." });
      return;
    }
    await removeFavorite(req.user.id, paramValue(req.params.id));
    res.status(200).json({ message: "Favorito eliminado." });
  } catch (error: unknown) {
    sendError(res, error);
  }
};
