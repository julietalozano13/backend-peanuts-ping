import mongoose from "mongoose";
import { ENV } from "./env.js";

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!ENV.MONGO_URI) {
    throw new Error("MONGO_URI is not set");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(ENV.MONGO_URI, {
      bufferCommands: false, 
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");

  return cached.conn;
};
