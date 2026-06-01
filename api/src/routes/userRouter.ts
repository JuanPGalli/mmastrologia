import { Router } from "express";

import {
  registerUserHandler,
  loginUserHandler,
} from "../handlers/userHandlers";

const userRouter = Router();

userRouter.post("/register", registerUserHandler);
userRouter.post("/login", loginUserHandler);

export default userRouter;
