import { Router } from "express";
import { postContactHandler } from "../handlers/contactHandlers";
import { formLimiter } from "../middleware/rateLimiters";

const router = Router();

router.post("/", formLimiter, postContactHandler);

export default router;
