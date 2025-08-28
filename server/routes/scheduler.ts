import { authenticateToken } from "../middleware/auth";
import { Router } from "express";

const router = Router();

router.get("/", authenticateToken, "/", (req, res) => {
  res.json({ message: "Scheduler route placeholder" });
});

export default router;
