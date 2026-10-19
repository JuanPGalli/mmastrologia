import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const session = getStoredSession();
  if (!session?.token) throw new Error('Necesitás iniciar sesión.');
  return { Authorization: `Bearer ${session.token}` };
};

// payerEmail: el email de la cuenta de Mercado Pago con la que se va a pagar.
export const crearSuscripcion = async (payerEmail) => {
  const response = await axios.post(
    `${apiUrl}/api/suscripcion/crear`,
    { payerEmail },
    { headers: authHeaders() }
  );
  return response.data; // { initPoint }
};

export const obtenerEstadoSuscripcion = async () => {
  const response = await axios.get(`${apiUrl}/api/suscripcion/estado`, {
    headers: authHeaders(),
  });
  return response.data; // { activa, status, renueva, vigenteHasta, pruebaGratisUsada }
};

// Al volver de Mercado Pago: consulta el estado real sin esperar al webhook.
export const sincronizarSuscripcion = async () => {
  const response = await axios.post(`${apiUrl}/api/suscripcion/sincronizar`, {}, { headers: authHeaders() });
  return response.data;
};

export const cancelarSuscripcion = async () => {
  const response = await axios.post(`${apiUrl}/api/suscripcion/cancelar`, {}, { headers: authHeaders() });
  return response.data;
};
