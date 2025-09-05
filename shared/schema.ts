import { pgTable, serial, varchar, text, timestamp, integer, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).default("user"), // user, admin, agency
  tenantId: varchar("tenant_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tenants table (for white-label multi-tenancy)
export const tenants = pgTable("tenants", {
  id: varchar("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull().unique(),
  branding: json("branding").$type<{
    logo: string;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  }>(),
  settings: json("settings").$type<{
    openaiApiKey: string;
    socialPlatforms: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Posts (AI generated or user created)
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  content: text("content").notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // instagram, twitter, linkedin, facebook
  status: varchar("status", { length: 50 }).default("draft"), // draft, scheduled, published, failed
  scheduledAt: timestamp("scheduled_at"),
  publishedAt: timestamp("published_at"),
  metadata: json("metadata").$type<{
    imageUrl?: string;
    hashtags?: string[];
    mentions?: string[];
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics for post performance
export const analytics = pgTable("analytics", {
  id: varchar("id").primaryKey(),
  postId: varchar("post_id").references(() => posts.id).notNull(),
  tenantId: varchar("tenant_id").references(() => tenants.id).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  metrics: json("metrics").$type<{
    views?: number;
    likes?: number;
    shares?: number;
    comments?: number;
    clicks?: number;
    impressions?: number;
  }>(),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

// Subscriptions (Stripe integration later)
export const subscriptions = pgTable("subscriptions", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(), // free, pro, agency
  stripeId: varchar("stripe_id", { length: 255 }), // Stripe subscription ID
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertTenantSchema = createInsertSchema(tenants).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertPostSchema = createInsertSchema(posts).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertAnalyticsSchema = createInsertSchema(analytics).omit({ 
  id: true, 
  recordedAt: true 
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Tenant = typeof tenants.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
