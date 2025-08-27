import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "Scheduler route placeholder" });
});

export default router;
