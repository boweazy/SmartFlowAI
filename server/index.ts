import express from "express";
import path from "path";
import { fileURLToPath } from "url";
// import session from "express-session";
// import pgSession from "connect-pg-simple";
import cors from "cors";
import routes from "./routes.js";

// ✅ Needed for __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Session setup temporarily disabled for testing
// TODO: Add proper session handling later

// ✅ API routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "SmartFlowAI API running 🚀" });
});

app.use("/api", routes);

// ✅ Serve frontend build in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../client/dist");
  app.use(express.static(clientPath));

  // Handle React router (SPA fallback)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
