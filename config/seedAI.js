import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import User from "../models/User.js";
import cloudinary from "./cloudinary.js";
import fs from "fs";

dotenv.config();

const avatarPath = "C:/Users/ASUS/.gemini/antigravity/brain/754972c6-e6cf-44a4-83e0-805a02b0bfc0/ai_friend_avatar_1780515050140.png";

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    let imageUrl = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400";

    if (fs.existsSync(avatarPath)) {
      console.log("Uploading avatar to Cloudinary...");
      const result = await cloudinary.uploader.upload(avatarPath, {
        folder: "profiles",
      });
      imageUrl = result.secure_url;
      console.log("Uploaded successfully to Cloudinary:", imageUrl);
    } else {
      console.warn("Avatar file not found at path:", avatarPath);
    }

    const email = "ai@io.social";
    const userExists = await User.findOne({ email });

    if (userExists) {
      userExists.name = "io. AI Friend";
      userExists.imageUrl = imageUrl;
      await userExists.save();
      console.log("AI Friend User updated in DB:", userExists);
    } else {
      const hashedPassword = await bcrypt.hash("ai-secret-password-12345", 10);
      const newUser = await User.create({
        name: "io. AI Friend",
        email,
        password: hashedPassword,
        imageUrl,
      });
      console.log("AI Friend User created in DB:", newUser);
    }

    await mongoose.connection.close();
    console.log("Seeding complete. MongoDB connection closed.");
  } catch (error) {
    console.error("Seeding error:", error);
    process.exit(1);
  }
}

seed();
