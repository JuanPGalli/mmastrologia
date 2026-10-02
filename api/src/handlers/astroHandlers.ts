import { RequestHandler } from "express";
import { RequestConAcceso } from "../middleware/suscripcion";
import {
  generarInformeAstrologico,
  generarSinastria,
  obtenerHoroscopoDiario,
  validarDatosNacimiento,
} from "../controllers/astroController";
import { marcarPruebaGratisUsada } from "../controllers/suscripcionController";
import { ValidationError } from "../utils/errors";
import { User } from "../models/User";

const responderError = (res: Parameters<RequestHandler>[1], error: unknown, contexto: string) => {
  const message = error instanceof Error ? error.message : "Error inesperado.";
  if (error instanceof ValidationError) {
    res.status(400).json({ error: message });
    return;
  }
  console.error(`[${contexto}] error técnico:`, error);
  res.status(502).json({ error: message, soporte: true });
};

const consumirPruebaSiCorresponde = async (req: RequestConAcceso) => {
  if (req.accesoViaPrueba && req.user) {
    await marcarPruebaGratisUsada(req.user.id);
  }
};

export const postInformeHandler: RequestHandler = async (req: RequestConAcceso, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const informe = await generarInformeAstrologico(req.body);

    try {
      const datos = validarDatosNacimiento(req.body);
      await User.findByIdAndUpdate(req.user.id, { birthData: datos });
    } catch (guardadoError) {
      console.error("[astro/informe] no se pudo guardar birthData:", guardadoError);
    }

    await consumirPruebaSiCorresponde(req);
    res.status(200).json(informe);
  } catch (error: unknown) {
    responderError(res, error, "astro/informe");
  }
};

export const getHoroscopoDiarioHandler: RequestHandler = async (req: RequestConAcceso, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const horoscopo = await obtenerHoroscopoDiario(req.user.id);
    await consumirPruebaSiCorresponde(req);
    res.status(200).json(horoscopo);
  } catch (error: unknown) {
    responderError(res, error, "astro/horoscopo-diario");
  }
};

export const postSinastriaHandler: RequestHandler = async (req: RequestConAcceso, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const resultado = await generarSinastria(req.body);
    await consumirPruebaSiCorresponde(req);
    res.status(200).json(resultado);
  } catch (error: unknown) {
    responderError(res, error, "astro/sinastria");
  }
};
