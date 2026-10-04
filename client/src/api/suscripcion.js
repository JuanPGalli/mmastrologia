import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const session = getStoredSession();
  if (!session?.token) throw new Error('Necesitás iniciar sesión.');
  return { Authorization: `Bearer ${session.token}` };
};

export const crearSuscripcion = async () => {
  const response = await axios.post(
    `${apiUrl}/api/suscripcion/crear`,
    {},
    { headers: authHeaders() }
  );
  return response.data;
};

export const obtenerEstadoSuscripcion = async () => {
  const response = await axios.get(`${apiUrl}/api/suscripcion/estado`, {
    headers: authHeaders(),
  });
  return response.data;
};
