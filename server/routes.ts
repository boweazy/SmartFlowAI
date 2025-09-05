import { Router } from "express";
import { authService } from "./services/index";
import { storage } from "./storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken } from "./middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const userData = insertUserSchema.extend({ confirmPassword: z.string() }).parse(req.body);
    if (userData.password !== userData.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const result = await authService.register(userData);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: "Registration failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });
    const result = await authService.login(email, password);
    res.json(result);
  } catch {
    res.status(401).json({ message: "Login failed" });
  }
});

router.get("/me", authenticateToken, async (req, res) => {
  const user = await storage.getUser((req as any).user.userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { password, ...profile } = user;
  res.json(profile);
});

export default router;
