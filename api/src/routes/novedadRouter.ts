import { Router } from "express";
import {
  createNovedadHandler,
  deleteNovedadHandler,
  getAdminNovedadesHandler,
  getNovedadByIdHandler,
  getNovedadesHandler,
  updateNovedadHandler,
} from "../handlers/novedadHandlers";
import { requireAdmin, requireAuth } from "../middleware/auth";

const novedadRouter = Router();

novedadRouter.get("/", getNovedadesHandler);
novedadRouter.get("/admin", requireAuth, requireAdmin, getAdminNovedadesHandler);
novedadRouter.get("/admin/:id", requireAuth, requireAdmin, getNovedadByIdHandler);
novedadRouter.post("/", requireAuth, requireAdmin, createNovedadHandler);
novedadRouter.put("/:id", requireAuth, requireAdmin, updateNovedadHandler);
novedadRouter.delete("/:id", requireAuth, requireAdmin, deleteNovedadHandler);

export default novedadRouter;
