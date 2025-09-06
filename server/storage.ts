import { type User, type InsertUser, type Tenant, type InsertTenant, type Post, type InsertPost, type Analytics, type InsertAnalytics } from "../shared/schema.js";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  
  // Tenant methods
  getTenant(id: string): Promise<Tenant | undefined>;
  getTenantByDomain(domain: string): Promise<Tenant | undefined>;
  createTenant(tenant: InsertTenant): Promise<Tenant>;
  updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined>;
  
  // Post methods
  getPost(id: string): Promise<Post | undefined>;
  getPostsByUser(userId: string): Promise<Post[]>;
  getPostsByTenant(tenantId: string): Promise<Post[]>;
  getScheduledPosts(): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined>;
  deletePost(id: string): Promise<boolean>;
  
  // Analytics methods
  getAnalytics(postId: string): Promise<Analytics[]>;
  getAnalyticsByTenant(tenantId: string): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(id: string, updates: Partial<Analytics>): Promise<Analytics | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private tenants: Map<string, Tenant> = new Map();
  private posts: Map<string, Post> = new Map();
  private analytics: Map<string, Analytics> = new Map();

  constructor() {
    // Initialize with default tenant
    const defaultTenant: Tenant = {
      id: "default-tenant",
      name: "SmartFlow Systems",
      domain: "localhost",
      branding: {
        logo: "/assets/logo.png",
        primaryColor: "#0EA5E9",
        secondaryColor: "#0284C7",
        accentColor: "#0369A1"
      },
      settings: {
        openaiApiKey: process.env.OPENAI_API_KEY || "",
        socialPlatforms: ["instagram", "twitter", "linkedin", "facebook"]
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set(defaultTenant.id, defaultTenant);
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Tenant methods
  async getTenant(id: string): Promise<Tenant | undefined> {
    return this.tenants.get(id);
  }

  async getTenantByDomain(domain: string): Promise<Tenant | undefined> {
    return Array.from(this.tenants.values()).find(tenant => tenant.domain === domain);
  }

  async createTenant(insertTenant: InsertTenant): Promise<Tenant> {
    const id = randomUUID();
    const tenant: Tenant = {
      ...insertTenant,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tenants.set(id, tenant);
    return tenant;
  }

  async updateTenant(id: string, updates: Partial<Tenant>): Promise<Tenant | undefined> {
    const tenant = this.tenants.get(id);
    if (!tenant) return undefined;
    
    const updatedTenant = { ...tenant, ...updates, updatedAt: new Date() };
    this.tenants.set(id, updatedTenant);
    return updatedTenant;
  }

  // Post methods
  async getPost(id: string): Promise<Post | undefined> {
    return this.posts.get(id);
  }

  async getPostsByUser(userId: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.userId === userId);
  }

  async getPostsByTenant(tenantId: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(post => post.tenantId === tenantId);
  }

  async getScheduledPosts(): Promise<Post[]> {
    const now = new Date();
    return Array.from(this.posts.values()).filter(
      post => post.status === "scheduled" && post.scheduledAt && post.scheduledAt <= now
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePost(id: string, updates: Partial<Post>): Promise<Post | undefined> {
    const post = this.posts.get(id);
    if (!post) return undefined;
    
    const updatedPost = { ...post, ...updates, updatedAt: new Date() };
    this.posts.set(id, updatedPost);
    return updatedPost;
  }

  async deletePost(id: string): Promise<boolean> {
    return this.posts.delete(id);
  }

  // Analytics methods
  async getAnalytics(postId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => analytics.postId === postId);
  }

  async getAnalyticsByTenant(tenantId: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(analytics => analytics.tenantId === tenantId);
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = randomUUID();
    const analytics: Analytics = {
      ...insertAnalytics,
      id,
      recordedAt: new Date(),
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async updateAnalytics(id: string, updates: Partial<Analytics>): Promise<Analytics | undefined> {
    const analytics = this.analytics.get(id);
    if (!analytics) return undefined;
    
    const updatedAnalytics = { ...analytics, ...updates };
    this.analytics.set(id, updatedAnalytics);
    return updatedAnalytics;
  }
}

export const storage = new MemStorage();
