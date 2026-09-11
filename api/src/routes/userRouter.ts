import { Router } from "express";

import {
  registerUserHandler,
  loginUserHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  googleLoginHandler,
} from "../handlers/userHandlers";
import { formLimiter, loginLimiter } from "../middleware/rateLimiters";

const userRouter = Router();

userRouter.post("/register", registerUserHandler);
userRouter.post("/login", loginLimiter, loginUserHandler);
userRouter.post("/forgot-password", formLimiter, forgotPasswordHandler);
userRouter.post("/reset-password", formLimiter, resetPasswordHandler);
userRouter.post("/google", loginLimiter, googleLoginHandler);

export default userRouter;
