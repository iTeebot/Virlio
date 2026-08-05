import { pgTable, text, timestamp, integer, uuid, index, jsonb, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { brands } from "./brands";

/**
 * Brand Automations master table
 */
export const brandAutomations = pgTable("brand_automations", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(), // draft | enabled | disabled
  is_enabled: boolean("is_enabled").default(false).notNull(),
  trigger_type: text("trigger_type").default("meme_published").notNull(),
  node_count: integer("node_count").default(2).notNull(),
  run_count: integer("run_count").default(0).notNull(),
  last_execution_at: timestamp("last_execution_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  created_by: uuid("created_by").references(() => users.id),
}, (table) => ({
  brandIdIdx: index("brand_automations_brand_id_idx").on(table.brand_id),
  statusIdx: index("brand_automations_status_idx").on(table.status),
  isEnabledIdx: index("brand_automations_is_enabled_idx").on(table.is_enabled),
}));

/**
 * Brand Automation Versions (Full React Flow graph snapshots)
 */
export const brandAutomationVersions = pgTable("brand_automation_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  automation_id: uuid("automation_id").notNull().references(() => brandAutomations.id),
  version: integer("version").default(1).notNull(),
  graph_data: jsonb("graph_data").notNull(), // { nodes: [], edges: [], viewport: {} }
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  created_by: uuid("created_by").references(() => users.id),
}, (table) => ({
  automationIdIdx: index("brand_automation_versions_automation_id_idx").on(table.automation_id),
}));

/**
 * Brand Automation Executions
 */
export const brandAutomationExecutions = pgTable("brand_automation_executions", {
  id: uuid("id").primaryKey().defaultRandom(),
  automation_id: uuid("automation_id").notNull().references(() => brandAutomations.id),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  version_id: uuid("version_id").references(() => brandAutomationVersions.id),
  trigger_event: text("trigger_event").notNull(), // e.g. meme_published
  status: text("status").default("completed").notNull(), // running | completed | failed
  error_message: text("error_message"),
  started_at: timestamp("started_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  completed_at: timestamp("completed_at", { mode: "date", withTimezone: true }),
}, (table) => ({
  automationIdIdx: index("brand_automation_exec_automation_id_idx").on(table.automation_id),
  brandIdIdx: index("brand_automation_exec_brand_id_idx").on(table.brand_id),
  statusIdx: index("brand_automation_exec_status_idx").on(table.status),
}));

/**
 * Brand Automation Step Logs
 */
export const brandAutomationLogs = pgTable("brand_automation_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  execution_id: uuid("execution_id").notNull().references(() => brandAutomationExecutions.id),
  node_id: text("node_id").notNull(),
  level: text("level").default("info").notNull(), // info | warn | error
  message: text("message").notNull(),
  payload: jsonb("payload"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  executionIdIdx: index("brand_automation_logs_execution_id_idx").on(table.execution_id),
}));
