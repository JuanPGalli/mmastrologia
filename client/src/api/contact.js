import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const sendContactMessage = async (payload) => {
  if (!apiUrl) {
    throw new Error('El sitio no está configurado correctamente. Intentá más tarde.');
  }

  try {
    await axios.post(`${apiUrl}/api/contact`, payload);
  } catch (error) {
    const message = error?.response?.data?.error || 'No se pudo enviar tu mensaje. Intentá de nuevo.';
    throw new Error(message);
  }
};
