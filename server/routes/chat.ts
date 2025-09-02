import { Router } from "express";
const router = Router();

router.post("/", (req, res) => {
  res.json({ reply: "🤖 AI bot placeholder response" });
});

export { router as chatRouter };
