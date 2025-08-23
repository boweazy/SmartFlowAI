import { CronJob } from "cron";
import { storage } from "../storage";
import { type Post } from "@shared/schema";

export class SchedulerService {
  private cronJob: CronJob;
  private isRunning = false;

  constructor() {
    // Check for scheduled posts every minute
    this.cronJob = new CronJob("0 * * * * *", () => {
      this.processScheduledPosts();
    });
  }

  start() {
    if (!this.isRunning) {
      this.cronJob.start();
      this.isRunning = true;
      console.log("Scheduler service started");
    }
  }

  stop() {
    if (this.isRunning) {
      this.cronJob.stop();
      this.isRunning = false;
      console.log("Scheduler service stopped");
    }
  }

  private async processScheduledPosts() {
    try {
      const scheduledPosts = await storage.getScheduledPosts();
      
      for (const post of scheduledPosts) {
        await this.publishPost(post);
      }
    } catch (error) {
      console.error("Error processing scheduled posts:", error);
    }
  }

  private async publishPost(post: Post) {
    try {
      console.log(`Publishing post ${post.id} to ${post.platform}`);
      
      // Simulate publishing to social media platform
      // In a real implementation, this would integrate with social media APIs
      const publishResult = await this.simulatePublish(post);
      
      if (publishResult.success) {
        await storage.updatePost(post.id, {
          status: "published",
          publishedAt: new Date(),
          metadata: {
            ...post.metadata,
            publishResult
          }
        });
        
        // Create analytics entry
        await storage.createAnalytics({
          postId: post.id,
          tenantId: post.tenantId,
          platform: post.platform,
          impressions: 0,
          likes: 0,
          comments: 0,
          shares: 0,
          clicks: 0,
          engagementRate: 0,
        });
        
        console.log(`Post ${post.id} published successfully to ${post.platform}`);
      } else {
        await storage.updatePost(post.id, {
          status: "failed",
          metadata: {
            ...post.metadata,
            error: publishResult.error
          }
        });
        
        console.error(`Failed to publish post ${post.id}:`, publishResult.error);
      }
    } catch (error) {
      console.error(`Error publishing post ${post.id}:`, error);
      await storage.updatePost(post.id, {
        status: "failed",
        metadata: {
          ...post.metadata,
          error: error instanceof Error ? error.message : "Unknown error"
        }
      });
    }
  }

  private async simulatePublish(post: Post): Promise<{ success: boolean; error?: string; postId?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
    
    // Simulate 90% success rate
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        postId: `${post.platform}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } else {
      return {
        success: false,
        error: "Failed to connect to social media API"
      };
    }
  }

  async schedulePost(postId: string, scheduledAt: Date): Promise<boolean> {
    try {
      const post = await storage.getPost(postId);
      if (!post) {
        throw new Error("Post not found");
      }

      await storage.updatePost(postId, {
        status: "scheduled",
        scheduledAt: scheduledAt
      });

      console.log(`Post ${postId} scheduled for ${scheduledAt.toISOString()}`);
      return true;
    } catch (error) {
      console.error("Error scheduling post:", error);
      return false;
    }
  }

  async cancelScheduledPost(postId: string): Promise<boolean> {
    try {
      const post = await storage.getPost(postId);
      if (!post || post.status !== "scheduled") {
        throw new Error("Post not found or not scheduled");
      }

      await storage.updatePost(postId, {
        status: "draft",
        scheduledAt: null
      });

      console.log(`Scheduled post ${postId} cancelled`);
      return true;
    } catch (error) {
      console.error("Error cancelling scheduled post:", error);
      return false;
    }
  }
}

export const schedulerService = new SchedulerService();
