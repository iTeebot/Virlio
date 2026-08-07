import { pgTable, text, timestamp, integer, uuid, uniqueIndex, index, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { brands } from "./brands";
import { badgeCategoryEnum, visibilityEnum, streakCategoryEnum, entityTypeEnum } from "./enums";

export const badges = pgTable("badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: badgeCategoryEnum("category"),
  level: integer("level").default(1),
  icon_url: text("icon_url"),
  requirements: jsonb("requirements"),
  visibility: visibilityEnum("visibility").default("public"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const userBadges = pgTable("user_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  badge_id: uuid("badge_id").notNull().references(() => badges.id),
  unlocked_at: timestamp("unlocked_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userBadgeUniqueIdx: uniqueIndex("user_badges_user_badge_idx").on(table.user_id, table.badge_id),
  userBadgeUnlockedIdx: index("user_badges_user_unlocked_idx").on(table.user_id, table.unlocked_at),
}));

export const brandBadges = pgTable("brand_badges", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  badge_id: uuid("badge_id").notNull().references(() => badges.id),
  unlocked_at: timestamp("unlocked_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  brandBadgeUniqueIdx: uniqueIndex("brand_badges_brand_badge_idx").on(table.brand_id, table.badge_id),
}));

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  category: text("category"),
  target_value: integer("target_value"),
  icon_url: text("icon_url"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const userAchievements = pgTable("user_achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  achievement_id: uuid("achievement_id").notNull().references(() => achievements.id),
  current_value: integer("current_value").default(0),
  completed_at: timestamp("completed_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userAchievementUniqueIdx: uniqueIndex("user_achievements_user_achievement_idx").on(table.user_id, table.achievement_id),
}));

export const streaks = pgTable("streaks", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  category: streakCategoryEnum("category").notNull(),
  current_streak: integer("current_streak").default(0),
  longest_streak: integer("longest_streak").default(0),
  last_activity_date: timestamp("last_activity_date", { mode: "date", withTimezone: true }),
  frozen_until: timestamp("frozen_until", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  streakUniqueIdx: uniqueIndex("streaks_user_category_idx").on(table.user_id, table.category),
}));

export const xpEvents = pgTable("xp_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(),
  reason: text("reason"),
  source_entity_type: entityTypeEnum("source_entity_type"),
  source_entity_id: uuid("source_entity_id"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});

export const userLevels = pgTable("user_levels", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().unique().references(() => users.id),
  current_level: integer("current_level").default(1),
  current_xp: integer("current_xp").default(0),
  lifetime_xp: integer("lifetime_xp").default(0),
  next_level_xp: integer("next_level_xp").default(100),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
});
