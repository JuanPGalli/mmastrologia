import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

const authHeaders = () => {
  const session = getStoredSession();
  if (!session?.token) throw new Error('Necesitás iniciar sesión.');
  return { Authorization: `Bearer ${session.token}` };
};

export const obtenerUltimaConsulta = async (tipo) => {
  const response = await axios.get(`${apiUrl}/api/astro/ultimo`, {
    params: { tipo },
    headers: authHeaders(),
  });
  return response.data.consulta; // { fecha, entrada, resultado } | null
};

export const generarInformeAstrologico = async (datos) => {
  if (!apiUrl) throw new Error('El sitio no está configurado correctamente.');

  const response = await axios.post(`${apiUrl}/api/astro/informe`, datos, {
    headers: authHeaders(),
  });
  return response.data;
};

export const generarSinastria = async (personaA, personaB) => {
  if (!apiUrl) throw new Error('El sitio no está configurado correctamente.');

  const response = await axios.post(
    `${apiUrl}/api/astro/sinastria`,
    { personaA, personaB },
    { headers: authHeaders() }
  );
  return response.data;
};