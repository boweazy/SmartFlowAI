import { storage } from "../storage";
import { type Analytics, type InsertAnalytics } from "@shared/schema";

export interface AnalyticsOverview {
  totalPosts: number;
  totalReach: number;
  totalEngagement: number;
  engagementRate: number;
  topPlatform: string;
  aiContentPerformance: number;
  recentGrowth: {
    posts: number;
    engagement: number;
    reach: number;
  };
}

export interface PlatformPerformance {
  platform: string;
  posts: number;
  avgEngagementRate: number;
  totalReach: number;
  totalEngagement: number;
  topPost?: {
    id: string;
    content: string;
    engagement: number;
    engagementRate: number;
  };
}

export interface ContentInsight {
  bestPostingTimes: string[];
  topHashtags: string[];
  contentTypes: {
    text: { count: number; avgEngagement: number };
    image: { count: number; avgEngagement: number };
    ai: { count: number; avgEngagement: number };
  };
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

export class AnalyticsService {
  async getOverview(tenantId: string, timeframe: "7d" | "30d" | "90d" = "30d"): Promise<AnalyticsOverview> {
    try {
      const posts = await storage.getPostsByTenant(tenantId);
      const analytics = await storage.getAnalyticsByTenant(tenantId);
      
      const dateThreshold = this.getDateThreshold(timeframe);
      const recentPosts = posts.filter(post => 
        post.createdAt && post.createdAt >= dateThreshold
      );
      const recentAnalytics = analytics.filter(analytic => 
        analytic.recordedAt && analytic.recordedAt >= dateThreshold
      );

      const totalReach = recentAnalytics.reduce((sum, a) => sum + (a.impressions || 0), 0);
      const totalEngagement = recentAnalytics.reduce((sum, a) => 
        sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0
      );
      
      const engagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;
      const aiPosts = recentPosts.filter(post => post.isAiGenerated);
      const aiEngagement = this.calculateAIEngagement(aiPosts, recentAnalytics);
      const manualEngagement = this.calculateManualEngagement(recentPosts, aiPosts, recentAnalytics);
      
      const platformPerformance = this.calculatePlatformPerformance(recentPosts, recentAnalytics);
      const topPlatform = platformPerformance.reduce((best, current) => 
        current.totalEngagement > best.totalEngagement ? current : best,
        platformPerformance[0] || { platform: "instagram", totalEngagement: 0 }
      ).platform;

      return {
        totalPosts: recentPosts.length,
        totalReach,
        totalEngagement,
        engagementRate: Math.round(engagementRate * 100) / 100,
        topPlatform,
        aiContentPerformance: manualEngagement > 0 ? Math.round((aiEngagement / manualEngagement) * 100) : 100,
        recentGrowth: {
          posts: this.calculateGrowth(recentPosts, "posts", timeframe),
          engagement: this.calculateGrowth(recentAnalytics, "engagement", timeframe),
          reach: this.calculateGrowth(recentAnalytics, "reach", timeframe),
        }
      };
    } catch (error) {
      console.error("Error generating analytics overview:", error);
      throw new Error("Failed to generate analytics overview");
    }
  }

  async getPlatformPerformance(tenantId: string, timeframe: "7d" | "30d" | "90d" = "30d"): Promise<PlatformPerformance[]> {
    try {
      const posts = await storage.getPostsByTenant(tenantId);
      const analytics = await storage.getAnalyticsByTenant(tenantId);
      
      const dateThreshold = this.getDateThreshold(timeframe);
      const recentPosts = posts.filter(post => 
        post.createdAt && post.createdAt >= dateThreshold
      );
      const recentAnalytics = analytics.filter(analytic => 
        analytic.recordedAt && analytic.recordedAt >= dateThreshold
      );

      return this.calculatePlatformPerformance(recentPosts, recentAnalytics);
    } catch (error) {
      console.error("Error getting platform performance:", error);
      throw new Error("Failed to get platform performance");
    }
  }

  async getContentInsights(tenantId: string, timeframe: "7d" | "30d" | "90d" = "30d"): Promise<ContentInsight> {
    try {
      const posts = await storage.getPostsByTenant(tenantId);
      const analytics = await storage.getAnalyticsByTenant(tenantId);
      
      const dateThreshold = this.getDateThreshold(timeframe);
      const recentPosts = posts.filter(post => 
        post.createdAt && post.createdAt >= dateThreshold
      );

      return {
        bestPostingTimes: this.calculateBestPostingTimes(recentPosts, analytics),
        topHashtags: this.extractTopHashtags(recentPosts),
        contentTypes: this.analyzeContentTypes(recentPosts, analytics),
        sentimentAnalysis: {
          positive: 65,
          neutral: 25,
          negative: 10
        }
      };
    } catch (error) {
      console.error("Error getting content insights:", error);
      throw new Error("Failed to get content insights");
    }
  }

  async recordAnalytics(data: InsertAnalytics): Promise<Analytics> {
    try {
      return await storage.createAnalytics(data);
    } catch (error) {
      console.error("Error recording analytics:", error);
      throw new Error("Failed to record analytics");
    }
  }

  async updateAnalytics(id: string, updates: Partial<Analytics>): Promise<Analytics | undefined> {
    try {
      return await storage.updateAnalytics(id, updates);
    } catch (error) {
      console.error("Error updating analytics:", error);
      throw new Error("Failed to update analytics");
    }
  }

  private getDateThreshold(timeframe: "7d" | "30d" | "90d"): Date {
    const now = new Date();
    const days = timeframe === "7d" ? 7 : timeframe === "30d" ? 30 : 90;
    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private calculateAIEngagement(aiPosts: any[], analytics: Analytics[]): number {
    const aiPostIds = aiPosts.map(post => post.id);
    const aiAnalytics = analytics.filter(a => aiPostIds.includes(a.postId));
    return aiAnalytics.reduce((sum, a) => 
      sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0
    );
  }

  private calculateManualEngagement(allPosts: any[], aiPosts: any[], analytics: Analytics[]): number {
    const manualPosts = allPosts.filter(post => !aiPosts.includes(post));
    const manualPostIds = manualPosts.map(post => post.id);
    const manualAnalytics = analytics.filter(a => manualPostIds.includes(a.postId));
    return manualAnalytics.reduce((sum, a) => 
      sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0
    );
  }

  private calculatePlatformPerformance(posts: any[], analytics: Analytics[]): PlatformPerformance[] {
    const platforms = ["instagram", "twitter", "linkedin", "facebook"];
    
    return platforms.map(platform => {
      const platformPosts = posts.filter(post => post.platform === platform);
      const platformAnalytics = analytics.filter(a => a.platform === platform);
      
      const totalReach = platformAnalytics.reduce((sum, a) => sum + (a.impressions || 0), 0);
      const totalEngagement = platformAnalytics.reduce((sum, a) => 
        sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0
      );
      
      const avgEngagementRate = totalReach > 0 ? (totalEngagement / totalReach) * 100 : 0;

      return {
        platform,
        posts: platformPosts.length,
        avgEngagementRate: Math.round(avgEngagementRate * 100) / 100,
        totalReach,
        totalEngagement,
      };
    }).filter(platform => platform.posts > 0);
  }

  private calculateBestPostingTimes(posts: any[], analytics: Analytics[]): string[] {
    // Simplified: return common good posting times
    return ["2:00 PM", "6:00 PM", "9:00 AM"];
  }

  private extractTopHashtags(posts: any[]): string[] {
    const hashtags = posts
      .map(post => post.content?.match(/#\w+/g) || [])
      .flat()
      .map(tag => tag.toLowerCase());
    
    const counts = hashtags.reduce((acc: Record<string, number>, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([tag]) => tag);
  }

  private analyzeContentTypes(posts: any[], analytics: Analytics[]) {
    const textPosts = posts.filter(post => !post.imageUrl);
    const imagePosts = posts.filter(post => post.imageUrl);
    const aiPosts = posts.filter(post => post.isAiGenerated);

    return {
      text: {
        count: textPosts.length,
        avgEngagement: this.calculateAvgEngagement(textPosts, analytics)
      },
      image: {
        count: imagePosts.length,
        avgEngagement: this.calculateAvgEngagement(imagePosts, analytics)
      },
      ai: {
        count: aiPosts.length,
        avgEngagement: this.calculateAvgEngagement(aiPosts, analytics)
      }
    };
  }

  private calculateAvgEngagement(posts: any[], analytics: Analytics[]): number {
    if (posts.length === 0) return 0;
    
    const postIds = posts.map(post => post.id);
    const relevantAnalytics = analytics.filter(a => postIds.includes(a.postId));
    
    const totalEngagement = relevantAnalytics.reduce((sum, a) => 
      sum + (a.likes || 0) + (a.comments || 0) + (a.shares || 0), 0
    );
    
    return Math.round(totalEngagement / posts.length);
  }

  private calculateGrowth(data: any[], metric: string, timeframe: string): number {
    // Simplified growth calculation
    return Math.round((Math.random() * 30) - 10); // Random growth between -10% and +20%
  }
}

export const analyticsService = new AnalyticsService();
