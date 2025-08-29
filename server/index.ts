import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Health check route
app.get("/", (req, res) => {
  res.send({ status: "ok", message: "SmartFlowAI backend is running 🚀" });
});

// ✅ Use Render's PORT, fallback 3000 locally
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ SmartFlowAI server running on port ${PORT}`);
});
