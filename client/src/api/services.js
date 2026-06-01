import axios from 'axios';
import { services as fallbackServices } from '../data/services';

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
