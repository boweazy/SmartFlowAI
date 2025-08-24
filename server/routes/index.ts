import { Express } from "express";
import { createServer } from "http";

import authRoutes from "./auth";
import postRoutes from "./posts";
import aiRoutes from "./ai";
import schedulerRoutes from "./scheduler";
import analyticsRoutes from "./analytics";

export async function registerRoutes(app: Express) {
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/scheduler", schedulerRoutes);
  app.use("/api/analytics", analyticsRoutes);

  return createServer(app);
}
