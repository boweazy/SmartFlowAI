// server/index.ts
import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import { createRequire } from "module";

// ✅ Fix for CommonJS packages (like cors) in ESM
const require = createRequire(import.meta.url);
const cors = require("cors");

dotenv.config();

const app = express();

// ✅ Use Render’s PORT or fallback
const PORT = process.env.PORT || 5000;

// ===== Middleware =====
app.use(express.json());
app.use(cors()); // allow all origins for now (can restrict later)

app.use(
  session({
    secret: process.env.JWT_SECRET || "defaultsecret",
    resave: false,
    saveUninitialized: false,
  })
);

// ===== Routes =====

// Health check (great for testing + uptime monitoring)
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Default route
app.get("/", (req, res) => {
  res.send("🚀 SmartFlowAI backend is running!");
});

// Example protected route (needs JWT later)
app.get("/secure", (req, res) => {
  res.send("🔒 Secure route placeholder");
});

// ===== Start server =====
const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// ✅ Handle port conflicts (dev safety)
server.on("error", (err: any) => {
  if (err.code === "EADDRINUSE") {
    console.error(`❌ Port ${PORT} already in use, trying another one...`);
    app.listen(0, () => {
      console.log(`✅ Server running on random free port`);
    });
  } else {
    throw err;
  }
});
