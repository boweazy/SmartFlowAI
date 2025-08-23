import { pgTable, serial, varchar, text, timestamp, integer, boolean } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 50 }).default("user"), // user, admin, agency
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Subscriptions (Stripe integration later)
export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  plan: varchar("plan", { length: 50 }).notNull(), // free, pro, agency
  stripeId: varchar("stripe_id", { length: 255 }), // Stripe subscription ID
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Posts (AI generated or user created)
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  scheduledFor: timestamp("scheduled_for"), // for scheduling
  published: boolean("published").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
