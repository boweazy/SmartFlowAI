import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import jwt from "jsonwebtoken";
import { storage } from "./storage";
import { authService } from "./services/auth";
import { aiContentService } from "./services/ai-content";
import { schedulerService } from "./services/scheduler";
import { analyticsService } from "./services/analytics";
import { insertUserSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-key-change-in-production";

// Middleware for authentication
const authenticateToken = async (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Start the scheduler service
  schedulerService.start();

  // Auth routes
  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const userData = insertUserSchema.extend({
        confirmPassword: z.string()
      }).parse(req.body);
      
      if (userData.password !== userData.confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      const result = await authService.register(userData);
      res.json(result);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Registration failed" 
      });
    }
  });

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      res.status(401).json({ 
        message: error instanceof Error ? error.message : "Login failed" 
      });
    }
  });

  app.post("/api/auth/refresh", authenticateToken, async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }

      const newToken = await authService.refreshToken(token);
      res.json({ token: newToken });
    } catch (error) {
      res.status(401).json({ 
        message: error instanceof Error ? error.message : "Token refresh failed" 
      });
    }
  });

  // User routes
  app.get("/api/user/profile", authenticateToken, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser((req as any).user.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  // Tenant routes
  app.get("/api/tenant", authenticateToken, async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const tenant = await storage.getTenant(tenantId);
      if (!tenant) {
        return res.status(404).json({ message: "Tenant not found" });
      }
      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tenant" });
    }
  });

  // Post routes
  app.get("/api/posts", authenticateToken, async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const posts = await storage.getPostsByTenant(tenantId);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts", authenticateToken, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).user.userId;
      const tenantId = (req as any).user.tenantId;
      
      const postData = insertPostSchema.parse({
        ...req.body,
        userId,
        tenantId
      });

      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Failed to create post" 
      });
    }
  });

  app.get("/api/posts/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user has access to this post
      const tenantId = (req as any).user.tenantId;
      if (post.tenantId !== tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch post" });
    }
  });

  app.put("/api/posts/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user has access to this post
      const tenantId = (req as any).user.tenantId;
      if (post.tenantId !== tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updatedPost = await storage.updatePost(req.params.id, req.body);
      res.json(updatedPost);
    } catch (error) {
      res.status(400).json({ message: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", authenticateToken, async (req: Request, res: Response) => {
    try {
      const post = await storage.getPost(req.params.id);
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      // Check if user has access to this post
      const tenantId = (req as any).user.tenantId;
      if (post.tenantId !== tenantId) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deletePost(req.params.id);
      res.json({ message: "Post deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete post" });
    }
  });

  // AI Content Generation routes
  app.post("/api/ai/generate-content", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { prompt, platform, tone, includeHashtags, includeImage, maxLength } = req.body;
      
      if (!prompt || !platform) {
        return res.status(400).json({ message: "Prompt and platform are required" });
      }

      const content = await aiContentService.generateContent({
        prompt,
        platform,
        tone,
        includeHashtags,
        includeImage,
        maxLength
      });

      res.json(content);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate content" 
      });
    }
  });

  app.post("/api/ai/analyze-content", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { content, platform } = req.body;
      
      if (!content || !platform) {
        return res.status(400).json({ message: "Content and platform are required" });
      }

      const analysis = await aiContentService.analyzeContentPerformance(content, platform);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze content" 
      });
    }
  });

  // Scheduler routes
  app.post("/api/scheduler/schedule", authenticateToken, async (req: Request, res: Response) => {
    try {
      const { postId, scheduledAt } = req.body;
      
      if (!postId || !scheduledAt) {
        return res.status(400).json({ message: "Post ID and scheduled time are required" });
      }

      const success = await schedulerService.schedulePost(postId, new Date(scheduledAt));
      if (success) {
        res.json({ message: "Post scheduled successfully" });
      } else {
        res.status(400).json({ message: "Failed to schedule post" });
      }
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to schedule post" 
      });
    }
  });

  app.post("/api/scheduler/cancel/:postId", authenticateToken, async (req: Request, res: Response) => {
    try {
      const success = await schedulerService.cancelScheduledPost(req.params.postId);
      if (success) {
        res.json({ message: "Scheduled post cancelled successfully" });
      } else {
        res.status(400).json({ message: "Failed to cancel scheduled post" });
      }
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to cancel scheduled post" 
      });
    }
  });

  // Analytics routes
  app.get("/api/analytics/overview", authenticateToken, async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const timeframe = req.query.timeframe as "7d" | "30d" | "90d" || "30d";
      
      const overview = await analyticsService.getOverview(tenantId, timeframe);
      res.json(overview);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch analytics overview" 
      });
    }
  });

  app.get("/api/analytics/platforms", authenticateToken, async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const timeframe = req.query.timeframe as "7d" | "30d" | "90d" || "30d";
      
      const platforms = await analyticsService.getPlatformPerformance(tenantId, timeframe);
      res.json(platforms);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch platform performance" 
      });
    }
  });

  app.get("/api/analytics/insights", authenticateToken, async (req: Request, res: Response) => {
    try {
      const tenantId = (req as any).user.tenantId;
      const timeframe = req.query.timeframe as "7d" | "30d" | "90d" || "30d";
      
      const insights = await analyticsService.getContentInsights(tenantId, timeframe);
      res.json(insights);
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to fetch content insights" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
