import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const session = getStoredSession();
  if (!session?.token) throw new Error('Necesitás iniciar sesión.');
  return { Authorization: `Bearer ${session.token}` };
};

export const fetchApprovedReviews = async () => {
  if (!apiUrl) return [];

  try {
    const response = await axios.get(`${apiUrl}/api/reviews`);
    return response.data;
  } catch {
    return [];
  }
};

export const submitReview = async (payload) => {
  if (!apiUrl) throw new Error('El sitio no está configurado correctamente.');

  try {
    const response = await axios.post(`${apiUrl}/api/reviews`, payload, {
      headers: authHeaders(),
    });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.error || 'No se pudo enviar la reseña.';
    throw new Error(message);
  }
};

export const fetchAdminReviews = async () => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL.');

  const response = await axios.get(`${apiUrl}/api/reviews/admin`, { headers: authHeaders() });
  return response.data;
};

export const setReviewApproval = async (id, approved) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL.');

  const response = await axios.patch(
    `${apiUrl}/api/reviews/${id}/approval`,
    { approved },
    { headers: authHeaders() }
  );
  return response.data;
};

export const deleteAdminReview = async (id) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL.');

  await axios.delete(`${apiUrl}/api/reviews/${id}`, { headers: authHeaders() });
};
