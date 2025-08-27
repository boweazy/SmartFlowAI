import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({ message: "AI route placeholder" });
});

export default router;
