import { type Express, type Request, type Response } from "express";

import authRoutes from "./auth";
import postRoutes from "./posts";
import aiRoutes from "./ai";
import schedulerRoutes from "./scheduler";
import analyticsRoutes from "./analytics";

export async function registerRoutes(app: Express) {
  // Register all API routes
  app.use("/api/auth", authRoutes);
  app.use("/api/posts", postRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/scheduler", schedulerRoutes);
  app.use("/api/analytics", analyticsRoutes);
  
  if (process.env.NODE_ENV !== "production") {
    app.get("/api/debug/env", (req: Request, res: Response) => {
      res.json({
        jwt: process.env.JWT_SECRET ? "✅ set" : "❌ missing",
        db: process.env.DATABASE_URL ? "✅ set" : "❌ missing",
        openai: process.env.OPENAI_API_KEY ? "✅ set" : "❌ missing",
      });
    });
  }
}
