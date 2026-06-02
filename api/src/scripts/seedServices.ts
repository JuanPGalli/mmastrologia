import dotenv from "dotenv";
import mongoose from "mongoose";
import { initialServices } from "../data/initialServices";
import { Service } from "../models/Service";

dotenv.config();

const seedServices = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required to seed services");
  }

  await mongoose.connect(mongoUri);

  const results = await Promise.all(
    initialServices.map((service) =>
      Service.findOneAndUpdate(
        { slug: service.slug },
        { $set: service },
        { new: true, runValidators: true, upsert: true }
      )
    )
  );

  console.log(`Seeded ${results.length} services`);
};

seedServices()
  .catch((error) => {
    console.error("Service seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
