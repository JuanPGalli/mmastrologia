import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import { IUser, User } from "../models/User";
import { hashPassword, comparePasswords } from "../utils/hash";
import { generateToken } from "../utils/jwt";
import { sendPasswordResetEmail } from "../services/emailService";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const toSafeUser = (user: IUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role || "user",
  picture: user.picture,
});

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const exists = await User.findOne({ email });
  if (exists) throw new Error("Email ya registrado");

  const hashed = await hashPassword(password);
  const newUser = new User({ name, email, password: hashed });

  await newUser.save();

  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  const user = (await User.findOne({ email })) as IUser;
  if (!user) throw new Error("Usuario no encontrado");
  if (!user.password) {
    throw new Error("Esta cuenta se creó con Google. Iniciá sesión con Google.");
  }

  const valid = await comparePasswords(password, user.password);
  if (!valid) throw new Error("Contraseña incorrecta");

  const token = generateToken(user.id, user.role || "user");

  return { token, user: toSafeUser(user) };
};

export const requestPasswordReset = async (email: string) => {
  const user = await User.findOne({ email });

  // Si el usuario no existe, no lo revelamos (evita enumeración de emails
  // registrados) — devolvemos éxito igual del lado del handler.
  if (!user) return;

  const rawToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.resetTokenHash = tokenHash;
  user.resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora
  await user.save();

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl) throw new Error("FRONTEND_URL no está configurada.");

  const resetUrl = `${frontendUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}&email=${encodeURIComponent(
    email
  )}`;

  await sendPasswordResetEmail(email, resetUrl);
};

export const resetPassword = async (email: string, token: string, newPassword: string) => {
  if (!newPassword || newPassword.length < 6) {
    throw new Error("La contraseña debe tener al menos 6 caracteres.");
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    email,
    resetTokenHash: tokenHash,
    resetTokenExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new Error("El link de recuperación es inválido o ya venció.");
  }

  user.password = await hashPassword(newPassword);
  user.resetTokenHash = undefined;
  user.resetTokenExpires = undefined;
  await user.save();
};

export const loginWithGoogle = async (idToken: string) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error("El login con Google no está configurado.");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error("No se pudo verificar la cuenta de Google.");
  }

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email }] });

  if (!user) {
    user = new User({
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      googleId: payload.sub,
      picture: payload.picture,
      role: "user",
    });
    await user.save();
  } else {
    let changed = false;
    if (!user.googleId) {
      // Ya existía con email/contraseña: vinculamos la cuenta de Google.
      user.googleId = payload.sub;
      changed = true;
    }
    if (payload.picture && user.picture !== payload.picture) {
      user.picture = payload.picture;
      changed = true;
    }
    if (changed) await user.save();
  }

  const token = generateToken(user.id, user.role || "user");

  return { token, user: toSafeUser(user) };
};
