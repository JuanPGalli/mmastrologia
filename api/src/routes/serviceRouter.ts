import { Router } from "express";
import {
  createServiceHandler,
  deleteServiceHandler,
  getServiceByIdHandler,
  getServiceBySlugHandler,
  getServicesHandler,
  updateServiceHandler,
} from "../handlers/serviceHandlers";
import { requireAdmin, requireAuth } from "../middleware/auth";

const serviceRouter = Router();

serviceRouter.get("/", getServicesHandler);
serviceRouter.get("/admin/:id", requireAuth, requireAdmin, getServiceByIdHandler);
serviceRouter.get("/:slug", getServiceBySlugHandler);
serviceRouter.post("/", requireAuth, requireAdmin, createServiceHandler);
serviceRouter.put("/:id", requireAuth, requireAdmin, updateServiceHandler);
serviceRouter.delete("/:id", requireAuth, requireAdmin, deleteServiceHandler);

export default serviceRouter;
