import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { RequestConAcceso } from "../middleware/suscripcion";
import { generarInformeAstrologico, generarSinastria } from "../controllers/astroController";
import { marcarPruebaGratisUsada } from "../controllers/suscripcionController";
import { ConsultaAstro, TipoConsulta } from "../models/ConsultaAstro";
import { ValidationError } from "../utils/errors";
import { fechaDeHoyArgentina } from "../utils/fechas";

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

// Límite de 1 consulta por tipo y por día (huso Argentina). Los
// administradores quedan exentos para poder probar sin restricciones. Se
// chequea ANTES de llamar a Gemini para no gastar IA en un pedido que se va
// a rechazar igual.
const yaConsultoHoy = async (userId: string, role: string, tipo: TipoConsulta): Promise<boolean> => {
  if (role === "admin") return false;
  const existe = await ConsultaAstro.exists({ userId, tipo, fecha: fechaDeHoyArgentina() });
  return Boolean(existe);
};

const MENSAJE_LIMITE: Record<TipoConsulta, string> = {
  informe: "Ya generaste tu informe de hoy. Mañana podés pedir uno nuevo.",
  sinastria: "Ya hiciste tu sinastría de hoy. Mañana podés hacer una nueva.",
};

const guardarConsulta = (
  userId: string,
  tipo: TipoConsulta,
  fecha: string,
  entrada: Record<string, unknown>,
  resultado: Record<string, unknown>
) => ConsultaAstro.create({ userId, tipo, fecha, entrada, resultado });

export const postInformeHandler: RequestHandler = async (req: RequestConAcceso, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    if (await yaConsultoHoy(req.user.id, req.user.role, "informe")) {
      res.status(429).json({ error: MENSAJE_LIMITE.informe, limiteDiario: true });
      return;
    }

    const fecha = fechaDeHoyArgentina();
    const { entrada, resultado } = await generarInformeAstrologico(req.body, fecha);
    await guardarConsulta(req.user.id, "informe", fecha, entrada, resultado);
    await consumirPruebaSiCorresponde(req);
    res.status(200).json({ fecha, entrada, resultado });
  } catch (error: unknown) {
    responderError(res, error, "astro/informe");
  }
};

export const postSinastriaHandler: RequestHandler = async (req: RequestConAcceso, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    if (await yaConsultoHoy(req.user.id, req.user.role, "sinastria")) {
      res.status(429).json({ error: MENSAJE_LIMITE.sinastria, limiteDiario: true });
      return;
    }

    const fecha = fechaDeHoyArgentina();
    const { entrada, resultado } = await generarSinastria(req.body);
    await guardarConsulta(req.user.id, "sinastria", fecha, entrada, resultado);
    await consumirPruebaSiCorresponde(req);
    res.status(200).json({ fecha, entrada, resultado });
  } catch (error: unknown) {
    responderError(res, error, "astro/sinastria");
  }
};

// Última consulta guardada del tipo pedido. Solo exige estar logueado (no
// pasa por la suscripción): una persona que ya usó su prueba gratis tiene
// que poder seguir viendo su último resultado.
export const getUltimaConsultaHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  const tipo = req.query.tipo;
  if (tipo !== "informe" && tipo !== "sinastria") {
    res.status(400).json({ error: "Tipo de consulta inválido." });
    return;
  }

  try {
    const consulta = await ConsultaAstro.findOne({ userId: req.user.id, tipo }).sort({ createdAt: -1 }).lean();
    res.status(200).json({
      consulta: consulta
        ? { fecha: consulta.fecha, entrada: consulta.entrada, resultado: consulta.resultado }
        : null,
    });
  } catch (error: unknown) {
    responderError(res, error, "astro/ultimo");
  }
};
