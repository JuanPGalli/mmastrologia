import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const session = getStoredSession();
  if (!session?.token) throw new Error('Necesitás iniciar sesión.');
  return { Authorization: `Bearer ${session.token}` };
};

export const fetchMyFavorites = async () => {
  if (!apiUrl) return [];

  const response = await axios.get(`${apiUrl}/api/favorites`, { headers: authHeaders() });
  return response.data;
};

export const addFavorite = async (itemType, itemId) => {
  if (!apiUrl) throw new Error('El sitio no está configurado correctamente.');

  const response = await axios.post(
    `${apiUrl}/api/favorites`,
    { itemType, itemId },
    { headers: authHeaders() }
  );
  return response.data;
};

export const removeFavorite = async (favoriteId) => {
  if (!apiUrl) throw new Error('El sitio no está configurado correctamente.');

  await axios.delete(`${apiUrl}/api/favorites/${favoriteId}`, { headers: authHeaders() });
};
