import { Router } from "express";
import serviceRouter from "./serviceRouter";
import userRouter from "./userRouter";
import postRouter from "./postRouter";
import contactRouter from "./contactRouter";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/services", serviceRouter);
router.use("/auth", userRouter);
router.use("/posts", postRouter);
router.use("/contact", contactRouter);

export default router;
