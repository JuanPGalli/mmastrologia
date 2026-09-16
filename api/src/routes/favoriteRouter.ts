import { Router } from "express";
import {
  deleteFavoriteHandler,
  getMyFavoritesHandler,
  postFavoriteHandler,
} from "../handlers/favoriteHandlers";
import { requireAuth } from "../middleware/auth";

const favoriteRouter = Router();

favoriteRouter.get("/", requireAuth, getMyFavoritesHandler);
favoriteRouter.post("/", requireAuth, postFavoriteHandler);
favoriteRouter.delete("/:id", requireAuth, deleteFavoriteHandler);

export default favoriteRouter;
