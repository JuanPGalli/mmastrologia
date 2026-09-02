import { RequestHandler } from "express";
import { paramValue } from "../utils/params";
import {
  createService,
  deleteServiceById,
  getAllServices,
  getServiceById,
  getServiceBySlug,
  updateServiceById,
} from "../controllers/serviceController";

const sendError = (res: Parameters<RequestHandler>[1], error: unknown) => {
  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(400).json({ error: "Unknown error" });
};

export const getServicesHandler: RequestHandler = async (req, res) => {
  try {
    const services = await getAllServices(req.query);
    res.status(200).json(services);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getAdminServicesHandler: RequestHandler = async (_req, res) => {
  try {
    const services = await getAllServices({ includeInactive: true });
    res.status(200).json(services);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getServiceBySlugHandler: RequestHandler = async (req, res) => {
  try {
    const service = await getServiceBySlug(paramValue(req.params.slug));
    res.status(200).json(service);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getServiceByIdHandler: RequestHandler = async (req, res) => {
  try {
    const service = await getServiceById(paramValue(req.params.id));
    res.status(200).json(service);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const createServiceHandler: RequestHandler = async (req, res) => {
  try {
    const service = await createService(req.body);
    res.status(201).json(service);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const updateServiceHandler: RequestHandler = async (req, res) => {
  try {
    const service = await updateServiceById(paramValue(req.params.id), req.body);
    res.status(200).json(service);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const deleteServiceHandler: RequestHandler = async (req, res) => {
  try {
    const service = await deleteServiceById(paramValue(req.params.id));
    res.status(200).json({ message: "Servicio eliminado", service });
  } catch (error: unknown) {
    sendError(res, error);
  }
};
