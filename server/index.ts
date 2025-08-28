import express, { Express, Request, Response } from "express";
import { createServer } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth";
import postRoutes from "./routes/posts";
import aiRoutes from "./routes/ai";
import schedulerRoutes from "./routes/scheduler";
import analyticsRoutes from "./routes/analytics";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
app.use(express.json());

// Logger middleware
app.use((req: Request, res: Response, next) => {
  const log = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  fs.appendFileSync(path.join(__dirname, "../logs/debug.log"), log);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/scheduler", schedulerRoutes);
app.use("/api/analytics", analyticsRoutes);

// Debug
if (process.env.NODE_ENV !== "production") {
  app.get("/api/debug/env", (req: Request, res: Response) => {
    res.json({
      jwt: process.env.JWT_SECRET ? "✅ set" : "❌ missing",
      db: process.env.DATABASE_URL ? "✅ set" : "❌ missing",
      openai: process.env.OPENAI_API_KEY ? "✅ set" : "❌ missing",
    });
  });
}

// Healthcheck
app.get("/", (req: Request, res: Response) => {
  res.json({ status: "✅ SmartFlowAI running" });
});

// Serve frontend
app.use(express.static(path.join(__dirname, "../dist/public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/public/index.html"));
});

export default createServer(app);

// Root healthcheck
app.get("/", (req: Request, res: Response) => {
  res.send("🚀 SmartFlowAI backend is running. Try /api/debug/env");
});
