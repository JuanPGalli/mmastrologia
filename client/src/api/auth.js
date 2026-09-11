import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
const tokenKey = 'mmastrologia_admin_token';
const userKey = 'mmastrologia_admin_user';

export const getStoredSession = () => {
  const token = localStorage.getItem(tokenKey);
  const userValue = localStorage.getItem(userKey);

  if (!token || !userValue) return null;

  try {
    return {
      token,
      user: JSON.parse(userValue),
    };
  } catch {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    return null;
  }
};

export const storeSession = ({ token, user }) => {
  localStorage.setItem(tokenKey, token);
  localStorage.setItem(userKey, JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem(tokenKey);
  localStorage.removeItem(userKey);
};

export const login = async ({ email, password }) => {
  if (!apiUrl) {
    throw new Error('Configurá VITE_API_URL para iniciar sesión.');
  }

  const response = await axios.post(`${apiUrl}/api/auth/login`, {
    email,
    password,
  });

  storeSession(response.data);
  return response.data;
};

export const register = async ({ name, email, password }) => {
  if (!apiUrl) {
    throw new Error('Configurá VITE_API_URL para registrarte.');
  }

  await axios.post(`${apiUrl}/api/auth/register`, { name, email, password });
};

export const requestPasswordReset = async (email) => {
  if (!apiUrl) {
    throw new Error('Configurá VITE_API_URL para continuar.');
  }

  const response = await axios.post(`${apiUrl}/api/auth/forgot-password`, { email });
  return response.data;
};

export const resetPassword = async ({ email, token, password }) => {
  if (!apiUrl) {
    throw new Error('Configurá VITE_API_URL para continuar.');
  }

  const response = await axios.post(`${apiUrl}/api/auth/reset-password`, {
    email,
    token,
    password,
  });
  return response.data;
};

export const loginWithGoogle = async (idToken) => {
  if (!apiUrl) {
    throw new Error('Configurá VITE_API_URL para iniciar sesión.');
  }

  const response = await axios.post(`${apiUrl}/api/auth/google`, { idToken });
  storeSession(response.data);
  return response.data;
};
