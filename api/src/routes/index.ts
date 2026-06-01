import { Router } from "express";
import serviceRouter from "./serviceRouter";
import userRouter from "./userRouter";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/services", serviceRouter);
router.use("/auth", userRouter);

export default router;
