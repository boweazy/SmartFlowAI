import { Router } from "express";
import { authService } from "../services/auth";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  try {
    const userData = insertUserSchema.extend({
      confirmPassword: z.string(),
    }).parse(req.body);

    if (userData.password !== userData.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const result = await authService.register(userData);
    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : "Registration failed" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ message: error instanceof Error ? error.message : "Login failed" });
  }
});

// Refresh
router.post("/refresh", authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(400).json({ message: "Token required" });

    const newToken = await authService.refreshToken(token);
    res.json({ token: newToken });
  } catch (error) {
    res.status(401).json({ message: "Token refresh failed" });
  }
});

// Profile
router.get("/me", authenticateToken, async (req, res) => {
  try {
    const user = await storage.getUser((req as any).user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    const { password, ...userProfile } = user;
    res.json(userProfile);
  } catch {
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

export default router;
