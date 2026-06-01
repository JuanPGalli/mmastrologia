import { FilterQuery } from "mongoose";
import { IService, Service } from "../models/Service";

type ServiceFilters = {
  q?: unknown;
  category?: unknown;
  includeInactive?: unknown;
};

export const getAllServices = async (filters: ServiceFilters = {}) => {
  const query: FilterQuery<IService> = {};

  if (filters.includeInactive !== "true") {
    query.active = true;
  }

  if (typeof filters.category === "string" && filters.category.trim()) {
    query.category = filters.category.trim();
  }

  if (typeof filters.q === "string" && filters.q.trim()) {
    query.$text = { $search: filters.q.trim() };
  }

  return Service.find(query).sort({ order: 1, title: 1 });
};

export const getServiceBySlug = async (slug: string) => {
  const service = await Service.findOne({ slug, active: true });
  if (!service) throw new Error("Servicio no encontrado");
  return service;
};

export const getServiceById = async (id: string) => {
  const service = await Service.findById(id);
  if (!service) throw new Error("Servicio no encontrado");
  return service;
};

export const createService = async (payload: Partial<IService>) => {
  const service = new Service(payload);
  return service.save();
};

export const updateServiceById = async (
  id: string,
  payload: Partial<IService>
) => {
  const service = await Service.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!service) throw new Error("Servicio no encontrado");
  return service;
};

export const deleteServiceById = async (id: string) => {
  const service = await Service.findByIdAndDelete(id);
  if (!service) throw new Error("Servicio no encontrado");
  return service;
};
