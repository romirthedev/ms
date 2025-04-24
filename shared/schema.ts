import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table (keeping the original schema)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Contact form submissions
export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const contactSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  phone: true,
  message: true,
});

export type InsertContactSubmission = z.infer<typeof contactSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;

// Newsletter subscriptions
export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const newsletterSchema = createInsertSchema(newsletterSubscriptions).pick({
  email: true,
});

export type InsertNewsletterSubscription = z.infer<typeof newsletterSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;

// Stocks table
export const stocks = pgTable("stocks", {
  id: serial("id").primaryKey(),
  symbol: text("symbol").notNull().unique(),
  companyName: text("company_name").notNull(),
  sector: text("sector"),
  industry: text("industry"),
  currentPrice: real("current_price"),
  previousClose: real("previous_close"),
  priceChange: real("price_change"),
  priceChangePercent: real("price_change_percent"),
  marketCap: real("market_cap"),
  logoUrl: text("logo_url"),
  description: text("description"),
  website: text("website"),
  competitors: text("competitors").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStockSchema = createInsertSchema(stocks)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertStock = z.infer<typeof insertStockSchema>;
export type Stock = typeof stocks.$inferSelect;

// News items
export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  url: text("url").notNull(),
  imageUrl: text("image_url"),
  source: text("source").notNull(),
  publishedAt: timestamp("published_at").notNull(),
  stockSymbols: text("stock_symbols").array(),
  sentiment: real("sentiment"),
  sentimentDetails: jsonb("sentiment_details"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNewsItemSchema = createInsertSchema(newsItems)
  .omit({ id: true, createdAt: true });

export type InsertNewsItem = z.infer<typeof insertNewsItemSchema>;
export type NewsItem = typeof newsItems.$inferSelect;

// Stock analyses (predictions)
export const stockAnalyses = pgTable("stock_analyses", {
  id: serial("id").primaryKey(),
  stockId: integer("stock_id").notNull(),
  stockSymbol: text("stock_symbol").notNull(),
  companyName: text("company_name").notNull(),
  potentialRating: integer("potential_rating").notNull(), // 1-10 scale
  breakingNewsCount: integer("breaking_news_count"),
  positiveNewsCount: integer("positive_news_count"),
  negativeNewsCount: integer("negative_news_count"),
  summaryText: text("summary_text").notNull(),
  evidencePoints: text("evidence_points").array(),
  shortTermOutlook: text("short_term_outlook"),
  longTermOutlook: text("long_term_outlook"),
  relatedNewsIds: integer("related_news_ids").array(),
  predictedMovementDirection: text("predicted_movement_direction").notNull(), // "up", "down", "stable"
  predictedMovementPercent: real("predicted_movement_percent"),
  confidenceScore: real("confidence_score").notNull(), // 0-1 scale
  isBreakthrough: boolean("is_breakthrough").default(false),
  analysisDate: timestamp("analysis_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertStockAnalysisSchema = createInsertSchema(stockAnalyses)
  .omit({ id: true, createdAt: true, updatedAt: true });

export type InsertStockAnalysis = z.infer<typeof insertStockAnalysisSchema>;
export type StockAnalysis = typeof stockAnalyses.$inferSelect;

// User watchlists
export const userWatchlists = pgTable("user_watchlists", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  stockId: integer("stock_id").notNull(),
  addedAt: timestamp("added_at").defaultNow().notNull(),
  isAlertEnabled: boolean("is_alert_enabled").default(false),
  alertThresholdPercent: real("alert_threshold_percent"),
});

export const insertUserWatchlistSchema = createInsertSchema(userWatchlists)
  .omit({ id: true, addedAt: true });

export type InsertUserWatchlist = z.infer<typeof insertUserWatchlistSchema>;
export type UserWatchlist = typeof userWatchlists.$inferSelect;
