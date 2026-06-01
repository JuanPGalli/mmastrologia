import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export type AuthTokenPayload = {
  id: string;
  role: string;
};

export const generateToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, { expiresIn: "7d" });
};

export const verifyToken = (token: string): AuthTokenPayload => {
  const payload = jwt.verify(token, JWT_SECRET);

  if (
    typeof payload !== "object" ||
    payload === null ||
    typeof payload.id !== "string"
  ) {
    throw new Error("Token invalido");
  }

  return {
    id: payload.id,
    role: typeof payload.role === "string" ? payload.role : "user",
  };
};
