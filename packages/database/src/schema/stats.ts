import { pgTable, timestamp, integer, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { brands } from "./brands";

export const userStats = pgTable("user_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique().references(() => users.id),
  templates_uploaded: integer("templates_uploaded").default(0),
  templates_approved: integer("templates_approved").default(0),
  templates_rejected: integer("templates_rejected").default(0),
  memes_generated: integer("memes_generated").default(0),
  followers_count: integer("followers_count").default(0),
  following_count: integer("following_count").default(0),
  likes_received: integer("likes_received").default(0),
  bookmarks_received: integer("bookmarks_received").default(0),
  views_count: integer("views_count").default(0),
  badges_earned: integer("badges_earned").default(0),
  achievements_unlocked: integer("achievements_unlocked").default(0),
  current_streak: integer("current_streak").default(0),
  longest_streak: integer("longest_streak").default(0),
  current_xp: integer("current_xp").default(0),
  lifetime_xp: integer("lifetime_xp").default(0),
  current_level: integer("current_level").default(1),
  public_score: integer("public_score").default(0),
  contributor_score: integer("contributor_score").default(0),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const brandStats = pgTable("brand_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().unique().references(() => brands.id),
  memes_published: integer("memes_published").default(0),
  templates_count: integer("templates_count").default(0),
  followers_count: integer("followers_count").default(0),
  total_engagement: integer("total_engagement").default(0),
  total_views: integer("total_views").default(0),
  badges_earned: integer("badges_earned").default(0),
  current_streak: integer("current_streak").default(0),
  longest_streak: integer("longest_streak").default(0),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});
