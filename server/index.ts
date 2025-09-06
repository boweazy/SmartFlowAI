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
const PORT = parseInt(process.env.PORT || "5000", 10);

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

// ✅ Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientPath = path.join(__dirname, "../dist/public");
  app.use(express.static(clientPath));

  // Handle React router (SPA fallback)
  app.get("*", (req, res) => {
    res.sendFile(path.join(clientPath, "index.html"));
  });
} else {
  // In development, just serve the API
  app.get("*", (req, res) => {
    res.json({ 
      message: "SmartFlow AI Backend is running! Frontend should be served by Vite on port 5173",
      apiHealth: "✅ Working",
      endpoints: ["/api/health", "/api/register", "/api/login", "/api/me"]
    });
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 SmartFlow AI Server running on port ${PORT}`);
  console.log(`🌐 API available at http://localhost:${PORT}/api/health`);
});
