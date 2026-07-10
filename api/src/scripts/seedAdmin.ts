import dotenv from "dotenv";
import mongoose from "mongoose";
import { User } from "../models/User";
import { hashPassword } from "../utils/hash";

dotenv.config();

const seedAdmin = async () => {
  const mongoUri = process.env.MONGO_URI;
  const name = process.env.ADMIN_NAME || "Admin";
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!mongoUri) throw new Error("MONGO_URI is required to seed an admin user");
  if (!email) throw new Error("ADMIN_EMAIL is required to seed an admin user");
  if (!password) {
    throw new Error("ADMIN_PASSWORD is required to seed an admin user");
  }

  await mongoose.connect(mongoUri);

  const hashedPassword = await hashPassword(password);
  const admin = await User.findOneAndUpdate(
    { email },
    {
      $set: {
        name,
        email,
        password: hashedPassword,
        role: "admin",
      },
    },
    { new: true, runValidators: true, upsert: true }
  );

  console.log(`Admin user ready: ${admin.email}`);
};

seedAdmin()
  .catch((error) => {
    console.error("Admin seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
