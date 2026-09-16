import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

export const createPaymentPreference = async (payload) => {
  if (!apiUrl) {
    throw new Error('El sitio no está configurado correctamente. Intentá más tarde.');
  }

  try {
    const session = getStoredSession();
    const headers = session?.token ? { Authorization: `Bearer ${session.token}` } : undefined;

    const response = await axios.post(`${apiUrl}/api/payments/preference`, payload, { headers });
    return response.data;
  } catch (error) {
    const message = error?.response?.data?.error || 'No se pudo iniciar el pago. Intentá de nuevo.';
    throw new Error(message);
  }
};

export const fetchPaymentByReference = async (reference) => {
  if (!apiUrl || !reference) return null;

  try {
    const response = await axios.get(`${apiUrl}/api/payments/${reference}`);
    return response.data;
  } catch {
    return null;
  }
};

export const fetchAdminPayments = async () => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para ver los pagos.');

  const session = getStoredSession();
  if (!session?.token) {
    throw new Error('Necesitás iniciar sesión como administradora.');
  }

  const response = await axios.get(`${apiUrl}/api/payments/admin`, {
    headers: { Authorization: `Bearer ${session.token}` },
  });

  return response.data;
};

export const fetchMyPayments = async () => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para ver tus consultas.');

  const session = getStoredSession();
  if (!session?.token) {
    throw new Error('Necesitás iniciar sesión.');
  }

  const response = await axios.get(`${apiUrl}/api/payments/mine`, {
    headers: { Authorization: `Bearer ${session.token}` },
  });

  return response.data;
};

export const saveScheduledDate = async (reference, eventUri) => {
  if (!apiUrl || !reference) return;

  try {
    await axios.patch(`${apiUrl}/api/payments/${reference}/schedule`, { eventUri });
  } catch {
    // No es crítico si falla: el turno ya quedó agendado en Calendly igual.
  }
};
