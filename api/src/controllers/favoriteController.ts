import { Favorite, FavoriteItemType } from "../models/Favorite";
import { Post } from "../models/Post";
import { Service } from "../models/Service";

type FavoritePayload = {
  itemType?: unknown;
  itemId?: unknown;
};

const isValidItemType = (value: unknown): value is FavoriteItemType =>
  value === "service" || value === "post";

export const addFavorite = async (customerId: string, payload: FavoritePayload) => {
  const itemType = payload.itemType;
  const itemId = typeof payload.itemId === "string" ? payload.itemId : "";

  if (!isValidItemType(itemType) || !itemId) {
    throw new Error("Faltan datos del ítem a favoritar.");
  }

  const item =
    itemType === "service" ? await Service.findById(itemId) : await Post.findById(itemId);

  if (!item) throw new Error("El ítem no existe.");

  try {
    return await Favorite.create({
      customerId,
      itemType,
      itemId,
      itemTitle: item.title,
      itemSlug: item.slug,
    });
  } catch (error: unknown) {
    if (error instanceof Error && (error as { code?: number }).code === 11000) {
      return Favorite.findOne({ customerId, itemType, itemId });
    }
    throw error;
  }
};

export const removeFavorite = async (customerId: string, favoriteId: string) => {
  const favorite = await Favorite.findOneAndDelete({ _id: favoriteId, customerId });
  if (!favorite) throw new Error("Favorito no encontrado.");
  return favorite;
};

export const getMyFavorites = async (customerId: string) => {
  return Favorite.find({ customerId }).sort({ createdAt: -1 });
};
