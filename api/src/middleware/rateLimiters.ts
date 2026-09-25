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

// Límite estricto para el informe astrológico con IA: cada request tiene un
// costo real (llamada a Gemini). Independiente del control de suscripción
// que se sume más adelante — esto es una protección de abuso a nivel red,
// no reemplaza la validación de acceso pago.
export const astroLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes de informe. Probá de nuevo más tarde." },
});