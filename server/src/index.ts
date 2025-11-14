import express from "express";
import cors from "cors";
import { config } from "./config/env";
import { connectDB } from "./db/mongoose";
import authRoutes from "./routes/authRoutes";
import resumeRoutes from "./routes/resumeRoutes";

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/resumes", resumeRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

async function start() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    app.listen(config.port, () => {
      console.log(`🚀 Server running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();
