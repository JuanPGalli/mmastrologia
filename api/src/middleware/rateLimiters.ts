import rateLimit from "express-rate-limit";

// Límite general para toda la API: protege contra abuso/spam moderado.
// No reemplaza protección DDoS de infraestructura (eso lo cubre Railway/Netlify).
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

// Límite estricto para el login: frena intentos de fuerza bruta de contraseña.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados intentos. Probá de nuevo en unos minutos." },
});

// Límite moderado para formularios públicos que disparan un email o un pago
// (contacto, creación de preferencia de MP): evita spam sin molestar a un
// usuario real que se equivoca un par de veces.
export const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Probá de nuevo en unos minutos." },
});
