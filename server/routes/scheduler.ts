import express from "express";
import { authenticateToken } from "../middleware/auth";

const router = express.Router();

router.get("/", authenticateToken, (req, res) => {
  res.json({ message: "OK", route: __filename });
});

export default router;
