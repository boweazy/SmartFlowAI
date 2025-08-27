import { Express } from "express";
import { createServer } from "http";

// Correct imports to point into /routes
import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import aiRoutes from "./routes/ai";
import schedulerRoutes from "./routes/scheduler";
import analyticsRoutes from "./routes/analytics";

export async function registerRoutes(app: Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/scheduler", schedulerRoutes);
  app.use("/api/analytics", analyticsRoutes);

  return createServer(app);
}