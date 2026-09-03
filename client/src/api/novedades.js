import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

export const fetchNovedades = async () => {
  if (!apiUrl) return [];

  try {
    const response = await axios.get(`${apiUrl}/api/novedades`);
    return response.data;
  } catch {
    return [];
  }
};

const getAdminHeaders = () => {
  const session = getStoredSession();

  if (!session?.token) {
    throw new Error('Necesitás iniciar sesión como administradora.');
  }

  return {
    Authorization: `Bearer ${session.token}`,
  };
};

export const fetchAdminNovedades = async () => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar novedades.');

  const response = await axios.get(`${apiUrl}/api/novedades/admin`, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

export const createAdminNovedad = async (payload) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar novedades.');

  const response = await axios.post(`${apiUrl}/api/novedades`, payload, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

export const updateAdminNovedad = async (id, payload) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar novedades.');

  const response = await axios.put(`${apiUrl}/api/novedades/${id}`, payload, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

export const deleteAdminNovedad = async (id) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar novedades.');

  const response = await axios.delete(`${apiUrl}/api/novedades/${id}`, {
    headers: getAdminHeaders(),
  });

  return response.data;
};
