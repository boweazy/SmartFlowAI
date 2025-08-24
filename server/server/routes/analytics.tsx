import { Router } from "express";
import { analyticsService } from "../services/analytics";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/overview", authenticateToken, async (req, res) => {
  const overview = await analyticsService.getOverview((req as any).user.tenantId, (req.query.timeframe as string) || "30d");
  res.json(overview);
});

export default router;