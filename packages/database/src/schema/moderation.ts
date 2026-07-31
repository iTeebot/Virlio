import { pgTable, text, timestamp, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { entityTypeEnum, reportReasonEnum, reportStatusEnum } from "./enums";

export const reports = pgTable("reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  reporter_id: uuid("reporter_id").notNull().references(() => users.id),
  entity_type: entityTypeEnum("entity_type").notNull(),
  entity_id: uuid("entity_id").notNull(),
  reason: reportReasonEnum("reason").notNull(),
  explanation: text("explanation"),
  ai_moderation_state: jsonb("ai_moderation_state"),
  moderator_id: uuid("moderator_id").references(() => users.id),
  moderator_notes: text("moderator_notes"),
  status: reportStatusEnum("status").default("pending"),
  resolved_at: timestamp("resolved_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  reportEntityIdx: index("reports_entity_idx").on(table.entity_type, table.entity_id),
  reporterIdx: index("reports_reporter_idx").on(table.reporter_id),
  reportStatusIdx: index("reports_status_idx").on(table.status),
}));
