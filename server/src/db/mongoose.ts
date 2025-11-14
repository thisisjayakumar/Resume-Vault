import mongoose from "mongoose";
import { config } from "../config/env";

export async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(config.mongoUri, {
    dbName: process.env.MONGODB_DB_NAME,
  });
}
