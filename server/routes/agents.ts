import { Router } from "express";
const router = Router();

router.get("/", (req, res) => {
  res.json({ agents: ["agent1", "agent2"] });
});

export { router as agentRouter };
