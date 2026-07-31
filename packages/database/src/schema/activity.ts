import { pgTable, text, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { activityTypeEnum, notificationTypeEnum, entityTypeEnum } from "./enums";

export const activities = pgTable("activities", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  activity_type: activityTypeEnum("activity_type").notNull(),
  entity_type: entityTypeEnum("entity_type"),
  entity_id: uuid("entity_id"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  activityUserIdx: index("activities_user_idx").on(table.user_id),
  activityCreatedAtIdx: index("activities_created_at_idx").on(table.created_at),
}));

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  type: notificationTypeEnum("type").notNull(),
  title: text("title"),
  message: text("message"),
  entity_type: entityTypeEnum("entity_type"),
  entity_id: uuid("entity_id"),
  read_at: timestamp("read_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  notificationUserIdx: index("notifications_user_idx").on(table.user_id),
  notificationReadAtIdx: index("notifications_read_at_idx").on(table.read_at),
  notificationCreatedAtIdx: index("notifications_created_at_idx").on(table.created_at),
}));
