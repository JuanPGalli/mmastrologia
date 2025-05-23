import bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

export const comparePasswords = async (input: string, hashed: string) => {
  return await bcrypt.compare(input, hashed);
};
