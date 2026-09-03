import { FilterQuery } from "mongoose";
import { INovedad, Novedad } from "../models/Novedad";

export const getActiveNovedades = async () => {
  const now = new Date();

  const query: FilterQuery<INovedad> = {
    active: true,
    $or: [{ endDate: { $exists: false } }, { endDate: null }, { endDate: { $gte: now } }],
  };

  return Novedad.find(query).sort({ order: 1, startDate: 1, createdAt: -1 });
};

export const getAllNovedadesAdmin = async () => {
  return Novedad.find().sort({ order: 1, startDate: 1, createdAt: -1 });
};

export const getNovedadById = async (id: string) => {
  const novedad = await Novedad.findById(id);
  if (!novedad) throw new Error("Novedad no encontrada");
  return novedad;
};

export const createNovedad = async (payload: Partial<INovedad>) => {
  const novedad = new Novedad(payload);
  return novedad.save();
};

export const updateNovedadById = async (id: string, payload: Partial<INovedad>) => {
  const novedad = await Novedad.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  });
  if (!novedad) throw new Error("Novedad no encontrada");
  return novedad;
};

export const deleteNovedadById = async (id: string) => {
  const novedad = await Novedad.findByIdAndDelete(id);
  if (!novedad) throw new Error("Novedad no encontrada");
  return novedad;
};
