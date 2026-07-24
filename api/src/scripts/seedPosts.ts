import dotenv from "dotenv";
import mongoose from "mongoose";
import { initialPosts } from "../data/initialPosts";
import { Post } from "../models/Post";

dotenv.config();

const seedPosts = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required to seed posts");
  }

  await mongoose.connect(mongoUri);

  const results = await Promise.all(
    initialPosts.map((post) =>
      Post.findOneAndUpdate(
        { slug: post.slug },
        { $set: post },
        { new: true, runValidators: true, upsert: true }
      )
    )
  );

  console.log(`Seeded ${results.length} posts`);
};

seedPosts()
  .catch((error) => {
    console.error("Post seed failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
