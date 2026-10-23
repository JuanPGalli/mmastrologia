import express from "express";
import cors from "cors";
import morgan from "morgan";
import router from "./routes";
import { generalLimiter } from "./middleware/rateLimiters";

const app = express();

// Detrás del proxy de Railway (1 salto): sin esto Express ve la IP del proxy
// como la de TODOS los visitantes, y express-rate-limit les arma un único
// contador compartido (8 intentos de login por 15 min para todo el sitio, 10
// informes por hora para todos los usuarios juntos, etc.).
app.set("trust proxy", 1);

app.use(morgan("dev"));
app.use(express.json());
app.use(cors());
app.use("/api", generalLimiter, router);

export default app;