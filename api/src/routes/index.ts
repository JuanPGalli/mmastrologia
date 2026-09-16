import { Router } from "express";
import serviceRouter from "./serviceRouter";
import userRouter from "./userRouter";
import postRouter from "./postRouter";
import contactRouter from "./contactRouter";
import novedadRouter from "./novedadRouter";
import paymentRouter from "./paymentRouter";
import favoriteRouter from "./favoriteRouter";
import reviewRouter from "./reviewRouter";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

router.use("/services", serviceRouter);
router.use("/auth", userRouter);
router.use("/posts", postRouter);
router.use("/contact", contactRouter);
router.use("/novedades", novedadRouter);
router.use("/payments", paymentRouter);
router.use("/favorites", favoriteRouter);
router.use("/reviews", reviewRouter);

export default router;
