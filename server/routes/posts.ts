import { Router } from "express";
import { storage } from "../storage";
import { insertPostSchema } from "@shared/schema";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.get("/", authenticateToken, async (req, res) => {
  const posts = await storage.getPostsByTenant((req as any).user.tenantId);
  res.json(posts);
});

router.post("/", authenticateToken, async (req, res) => {
  const postData = insertPostSchema.parse({ ...req.body, userId: (req as any).user.userId, tenantId: (req as any).user.tenantId });
  const post = await storage.createPost(postData);
  res.json(post);
});

export default router;