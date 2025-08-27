import express, { Express } from "express";
import { createServer } from "http";

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

  // Catch-all for unknown API routes
  app.use("/api/*", (req, res) => {
    res.status(404).json({ error: "API route not found" });
  });

  return createServer(app);
}
