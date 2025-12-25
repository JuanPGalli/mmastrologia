import { Router } from "express";

import {
  registerUserHandler,
  loginUserHandler,
} from "../handlers/userHandlers";

const productRouter = Router();

productRouter.post("/register", registerUserHandler);
productRouter.get("/login", loginUserHandler);

export default productRouter;
