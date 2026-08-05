import { pgTable, text, timestamp, integer, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { brands } from "./brands";

export const memeGenerations = pgTable("meme_generations", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  user_id: uuid("user_id").notNull().references(() => users.id),
  topic: text("topic").notNull(),
  campaign_name: text("campaign_name"),
  target_audience: text("target_audience"),
  marketing_goal: text("marketing_goal"),
  tone: text("tone"),
  cta: text("cta"),
  additional_notes: text("additional_notes"),
  meme_count: integer("meme_count").default(4).notNull(),
  provider_used: text("provider_used"),
  model_used: text("model_used"),
  generation_time_ms: integer("generation_time_ms"),
  total_tokens: integer("total_tokens"),
  prompt_version: text("prompt_version"),
  status: text("status").default("pending").notNull(),
  error_message: text("error_message"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  brandIdIdx: index("meme_gen_brand_id_idx").on(table.brand_id),
  userIdIdx: index("meme_gen_user_id_idx").on(table.user_id),
  statusIdx: index("meme_gen_status_idx").on(table.status),
}));
