import { useCallback, useEffect, useState } from 'react';
import { getStoredSession } from '../api/auth';
import { addFavorite, fetchMyFavorites, removeFavorite } from '../api/favorites';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loggedIn] = useState(() => Boolean(getStoredSession()));

  useEffect(() => {
    if (!loggedIn) return;
    fetchMyFavorites()
      .then(setFavorites)
      .catch(() => setFavorites([]));
  }, [loggedIn]);

  const findFavorite = useCallback(
    (itemType, itemId) => favorites.find((f) => f.itemType === itemType && f.itemId === itemId),
    [favorites]
  );

  const toggleFavorite = useCallback(
    async (itemType, itemId) => {
      const existing = findFavorite(itemType, itemId);

      if (existing) {
        await removeFavorite(existing._id);
        setFavorites((current) => current.filter((f) => f._id !== existing._id));
      } else {
        const created = await addFavorite(itemType, itemId);
        setFavorites((current) => [...current, created]);
      }
    },
    [findFavorite]
  );

  return {
    loggedIn,
    isFavorited: (itemType, itemId) => Boolean(findFavorite(itemType, itemId)),
    toggleFavorite,
  };
};
