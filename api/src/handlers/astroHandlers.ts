import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  generarInformeAstrologico,
  obtenerHoroscopoDiario,
  validarDatosNacimiento,
} from "../controllers/astroController";
import { ValidationError } from "../utils/errors";
import { User } from "../models/User";

const responderError = (res: Parameters<RequestHandler>[1], error: unknown, contexto: string) => {
  const message = error instanceof Error ? error.message : "Error inesperado.";
  if (error instanceof ValidationError) {
    // El usuario mandó datos incompletos/incorrectos.
    res.status(400).json({ error: message });
    return;
  }
  // Falla técnica (Gemini caído/saturado, cálculo de carta, etc.) — no es
  // un pedido inválido del usuario, así que no es un 400. Se loguea el
  // detalle completo en el servidor y se devuelve un mensaje prolijo.
  console.error(`[${contexto}] error técnico:`, error);
  res.status(502).json({ error: message, soporte: true });
};

// TODO(mini-app): cuando esté integrado Mercado Pago Preapproval, acá se
// suma la verificación de suscripción activa (y el descuento de la consulta
// de prueba gratis) antes de llamar a generarInformeAstrologico. Por ahora
// solo exige estar logueado, para no dejar el endpoint totalmente abierto
// mientras se termina esa parte.
export const postInformeHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const informe = await generarInformeAstrologico(req.body);

    // Se guarda la fecha/hora/lugar de nacimiento en la cuenta la primera
    // vez (y cada vez) que se genera un informe, para que el horóscopo
    // diario y futuras funciones (carta visual, etc.) no vuelvan a
    // pedirla. Es un guardado silencioso, no bloquea la respuesta si algo
    // rarísimo fallara acá — la persona ya tiene su informe.
    try {
      const datos = validarDatosNacimiento(req.body);
      await User.findByIdAndUpdate(req.user.id, { birthData: datos });
    } catch (guardadoError) {
      console.error("[astro/informe] no se pudo guardar birthData:", guardadoError);
    }

    res.status(200).json(informe);
  } catch (error: unknown) {
    responderError(res, error, "astro/informe");
  }
};

export const getHoroscopoDiarioHandler: RequestHandler = async (req: AuthRequest, res) => {
  if (!req.user) {
    res.status(401).json({ error: "Necesitás iniciar sesión." });
    return;
  }

  try {
    const horoscopo = await obtenerHoroscopoDiario(req.user.id);
    res.status(200).json(horoscopo);
  } catch (error: unknown) {
    responderError(res, error, "astro/horoscopo-diario");
  }
};
