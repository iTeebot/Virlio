import { pgTable, text, timestamp, integer, uuid, index, jsonb } from "drizzle-orm/pg-core";
import { templates } from "./templates";
import { users } from "./auth";

export const templateModerationLogs = pgTable("template_moderation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  template_id: uuid("template_id").notNull().references(() => templates.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  moderation_decision: text("moderation_decision").notNull(), // APPROVED, REJECTED, NEEDS_REVIEW, DUPLICATE
  confidence_score: integer("confidence_score").default(0),
  quality_score: integer("quality_score").default(0),
  risk_score: integer("risk_score").default(0),
  duplicate_score: integer("duplicate_score").default(0),
  reasoning: text("reasoning"),
  raw_ai_response: jsonb("raw_ai_response"),
  reviewed_by: uuid("reviewed_by").references(() => users.id),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  templateIdx: index("template_moderation_logs_template_idx").on(table.template_id),
  decisionIdx: index("template_moderation_logs_decision_idx").on(table.moderation_decision),
}));
