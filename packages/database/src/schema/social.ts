import { pgTable, text, timestamp, boolean, uuid, index, uniqueIndex, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { brands } from "./brands";
import { memes } from "./memes";
import { entityTypeEnum } from "./enums";
import { brandAutomations } from "./automations";

export const follows = pgTable("follows", {
  id: uuid("id").primaryKey().defaultRandom(),
  follower_id: uuid("follower_id").notNull().references(() => users.id),
  following_id: uuid("following_id").notNull(),
  following_type: entityTypeEnum("following_type").notNull(),
  notify: boolean("notify").default(true),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  followUniqueIdx: uniqueIndex("follows_follower_following_idx").on(table.follower_id, table.following_id, table.following_type),
}));

/**
 * Brand Centralized Social Connections table
 */
export const brandSocialConnections = pgTable("brand_social_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  platform: text("platform").notNull(), // e.g. facebook
  account_id: text("account_id"),
  page_id: text("page_id").notNull(),
  page_name: text("page_name").notNull(),
  page_image_url: text("page_image_url"),
  access_token: text("access_token").notNull(), // Server-side token
  refresh_token: text("refresh_token"),
  scopes: jsonb("scopes"),
  expires_at: timestamp("expires_at", { mode: "date", withTimezone: true }),
  connected_by: uuid("connected_by").references(() => users.id),
  is_active: boolean("is_active").default(true).notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  brandPlatformIdx: index("brand_social_conn_brand_platform_idx").on(table.brand_id, table.platform),
  uniqueBrandPageIdx: uniqueIndex("brand_social_conn_brand_page_idx").on(table.brand_id, table.platform, table.page_id),
}));

/**
 * Centralized Publishing History table for duplicate prevention & audit logging
 */
export const publishingHistory = pgTable("publishing_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  meme_id: uuid("meme_id").notNull().references(() => memes.id),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  platform: text("platform").notNull(), // e.g. facebook
  external_post_id: text("external_post_id").notNull(),
  page_id: text("page_id").notNull(),
  page_name: text("page_name"),
  automation_id: uuid("automation_id").references(() => brandAutomations.id),
  post_url: text("post_url"),
  published_at: timestamp("published_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  published_by: uuid("published_by").references(() => users.id),
  publish_type: text("publish_type").default("manual").notNull(), // manual | automation
  status: text("status").default("published").notNull(),
}, (table) => ({
  memePlatformPageIdx: uniqueIndex("pub_history_meme_platform_page_idx").on(table.meme_id, table.platform, table.page_id),
  brandPlatformIdx: index("pub_history_brand_platform_idx").on(table.brand_id, table.platform),
}));
