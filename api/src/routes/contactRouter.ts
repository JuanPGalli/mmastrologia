import { Router } from "express";
import { postContactHandler } from "../handlers/contactHandlers";

const router = Router();

router.post("/", postContactHandler);

export default router;
