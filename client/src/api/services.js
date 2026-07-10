import axios from 'axios';
import { services as fallbackServices } from '../data/services';
import { getStoredSession } from './auth';

const apiUrl = import.meta.env.VITE_API_URL;

const normalizeService = (service) => ({
  ...service,
  id: service.slug || service.id,
  slug: service.slug || service.id,
  title:
    service.title && service.subtitle && !service.title.includes(service.subtitle)
      ? `${service.title} - ${service.subtitle}`
      : service.title,
  shortDescription:
    service.shortDescription ||
    service.seo?.description ||
    service.description?.split('\n').find((line) => line.trim()) ||
    '',
});

export const getFallbackServices = () => fallbackServices.map(normalizeService);

export const fetchServices = async () => {
  if (!apiUrl) return getFallbackServices();

  try {
    const response = await axios.get(`${apiUrl}/api/services`);
    return response.data.map(normalizeService);
  } catch {
    return getFallbackServices();
  }
};

export const fetchServiceBySlug = async (slug) => {
  if (!apiUrl) {
    return getFallbackServices().find((service) => service.slug === slug);
  }

  try {
    const response = await axios.get(`${apiUrl}/api/services/${slug}`);
    return normalizeService(response.data);
  } catch {
    return getFallbackServices().find((service) => service.slug === slug);
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

export const fetchAdminServices = async () => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar servicios.');

  const response = await axios.get(`${apiUrl}/api/services/admin`, {
    headers: getAdminHeaders(),
  });

  return response.data.map(normalizeService);
};

export const updateAdminService = async (id, payload) => {
  if (!apiUrl) throw new Error('Configurá VITE_API_URL para administrar servicios.');

  const response = await axios.put(`${apiUrl}/api/services/${id}`, payload, {
    headers: getAdminHeaders(),
  });

  return normalizeService(response.data);
};
