import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI_DEV || "");
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed: ", error);
    process.exit(1); //Que es?
  }
};
