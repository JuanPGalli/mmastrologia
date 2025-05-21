import { Router } from "express";

import {
  getProductHandler,
  createProductHandler,
  editProductHandler,
  deleteProductHandler,
} from "../handlers/productHandlers";

const productRouter = Router();

productRouter.get("/", getProductHandler);
productRouter.get("/:id", getProductHandler);
productRouter.post("/", createProductHandler);
productRouter.put("/:id", editProductHandler);
productRouter.delete("/:id", deleteProductHandler);

export default productRouter;
