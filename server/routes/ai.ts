import { authenticateToken } from "../middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/", authenticateToken (req, res) => {
  res.json({ message: "AI route placeholder" });
});

export default router;
