import { sendContactEmail } from "../services/emailService";

type ContactPayload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  message?: unknown;
  // honeypot: campo invisible para usuarios reales, si viene con valor es spam
  website?: unknown;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const submitContactMessage = async (payload: ContactPayload) => {
  if (typeof payload.website === "string" && payload.website.trim()) {
    // Honeypot: silenciosamente "aceptamos" sin enviar nada, para no darle
    // feedback útil a un bot.
    return;
  }

  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  const email = typeof payload.email === "string" ? payload.email.trim() : "";
  const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
  const message = typeof payload.message === "string" ? payload.message.trim() : "";

  if (!name || !email || !message) {
    throw new Error("Faltan campos obligatorios (nombre, email y mensaje).");
  }

  if (!emailRegex.test(email)) {
    throw new Error("El email ingresado no es válido.");
  }

  if (name.length > 150 || message.length > 5000) {
    throw new Error("El mensaje es demasiado largo.");
  }

  await sendContactEmail({ name, email, phone: phone || undefined, message });
};
