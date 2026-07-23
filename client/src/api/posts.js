import axios from 'axios';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

const emptyResult = { posts: [], pagination: { page: 1, limit: 9, total: 0, totalPages: 1 } };

export const fetchPosts = async (params = {}) => {
  if (!apiUrl) return emptyResult;

  try {
    const response = await axios.get(`${apiUrl}/api/posts`, { params });
    return response.data;
  } catch {
    return emptyResult;
  }
};

export const fetchPostBySlug = async (slug) => {
  if (!apiUrl) return undefined;

  try {
    const response = await axios.get(`${apiUrl}/api/posts/${slug}`);
    return response.data;
  } catch {
    return undefined;
  }
};

export const addComment = async (slug, { name, email, text }) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para comentar.');

  const response = await axios.post(`${apiUrl}/api/posts/${slug}/comments`, {
    name,
    email,
    text,
  });

  return response.data;
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

export const fetchAdminPosts = async () => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar el blog.');

  const response = await axios.get(`${apiUrl}/api/posts/admin`, {
    params: { limit: 100 },
    headers: getAdminHeaders(),
  });

  return response.data.posts;
};

export const fetchAdminPostById = async (id) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar el blog.');

  const response = await axios.get(`${apiUrl}/api/posts/admin/${id}`, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

export const createAdminPost = async (payload) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar el blog.');

  const response = await axios.post(`${apiUrl}/api/posts`, payload, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

export const updateAdminPost = async (id, payload) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar el blog.');

  const response = await axios.put(`${apiUrl}/api/posts/${id}`, payload, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

export const deleteAdminPost = async (id) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar el blog.');

  const response = await axios.delete(`${apiUrl}/api/posts/${id}`, {
    headers: getAdminHeaders(),
  });

  return response.data;
};

export const deleteAdminComment = async (postId, commentId) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar el blog.');

  const response = await axios.delete(
    `${apiUrl}/api/posts/${postId}/comments/${commentId}`,
    { headers: getAdminHeaders() }
  );

  return response.data;
};
