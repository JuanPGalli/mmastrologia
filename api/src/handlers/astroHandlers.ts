import { RequestHandler } from "express";
import { AuthRequest } from "../middleware/auth";
import { generarInformeAstrologico } from "../controllers/astroController";
import { ValidationError } from "../utils/errors";

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
    res.status(200).json(informe);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Error inesperado.";
    if (error instanceof ValidationError) {
      // El usuario mandó datos incompletos/incorrectos.
      res.status(400).json({ error: message });
      return;
    }
    // Falla técnica (Gemini caído/saturado, cálculo de carta, etc.) — no es
    // un pedido inválido del usuario, así que no es un 400. Se loguea el
    // detalle completo en el servidor y se devuelve un mensaje prolijo.
    console.error("[astro/informe] error técnico:", error);
    res.status(502).json({
      error: message,
      soporte: true,
    });
  }
};
