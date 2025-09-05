import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes/index";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Register all API routes
registerRoutes(app);

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "✅ SmartFlowAI Backend Running!" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
