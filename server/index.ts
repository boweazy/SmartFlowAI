import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check endpoint
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "SmartFlowAI backend is running 🚀" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SmartFlowAI server running on port ${PORT}`);
});
