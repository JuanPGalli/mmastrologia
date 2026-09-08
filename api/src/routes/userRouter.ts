import { Router } from "express";

import {
  registerUserHandler,
  loginUserHandler,
} from "../handlers/userHandlers";
import { loginLimiter } from "../middleware/rateLimiters";

const userRouter = Router();

userRouter.post("/register", registerUserHandler);
userRouter.post("/login", loginLimiter, loginUserHandler);

export default userRouter;
