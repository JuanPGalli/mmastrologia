import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes";
import { generalLimiter } from "./middleware/rateLimiters";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use("/api", generalLimiter, router);

export default app;
