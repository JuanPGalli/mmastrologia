import { RequestHandler } from "express";
import { paramValue } from "../utils/params";
import {
  createNovedad,
  deleteNovedadById,
  getActiveNovedades,
  getAllNovedadesAdmin,
  getNovedadById,
  updateNovedadById,
} from "../controllers/novedadController";

const sendError = (res: Parameters<RequestHandler>[1], error: unknown) => {
  if (error instanceof Error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(400).json({ error: "Unknown error" });
};

export const getNovedadesHandler: RequestHandler = async (_req, res) => {
  try {
    const novedades = await getActiveNovedades();
    res.status(200).json(novedades);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getAdminNovedadesHandler: RequestHandler = async (_req, res) => {
  try {
    const novedades = await getAllNovedadesAdmin();
    res.status(200).json(novedades);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const getNovedadByIdHandler: RequestHandler = async (req, res) => {
  try {
    const novedad = await getNovedadById(paramValue(req.params.id));
    res.status(200).json(novedad);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const createNovedadHandler: RequestHandler = async (req, res) => {
  try {
    const novedad = await createNovedad(req.body);
    res.status(201).json(novedad);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const updateNovedadHandler: RequestHandler = async (req, res) => {
  try {
    const novedad = await updateNovedadById(paramValue(req.params.id), req.body);
    res.status(200).json(novedad);
  } catch (error: unknown) {
    sendError(res, error);
  }
};

export const deleteNovedadHandler: RequestHandler = async (req, res) => {
  try {
    const novedad = await deleteNovedadById(paramValue(req.params.id));
    res.status(200).json({ message: "Novedad eliminada", novedad });
  } catch (error: unknown) {
    sendError(res, error);
  }
};
