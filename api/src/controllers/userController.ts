import { IUser, User } from "../models/User";
import { hashPassword, comparePasswords } from "../utils/hash";
import { generateToken } from "../utils/jwt";

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

  const valid = await comparePasswords(password, user.password);
  if (!valid) throw new Error("Contraseña incorrecta");

  const token = generateToken(user.id, user.role || "user");

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role || "user",
    },
  };
};
