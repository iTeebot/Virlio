import { pgTable, text, timestamp, integer, uuid, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { entityTypeEnum } from "./enums";

export const cloudAssets = pgTable("cloud_assets", {
  id: uuid("id").primaryKey().defaultRandom(),
  public_id: text("public_id").unique(),
  secure_url: text("secure_url"),
  width: integer("width"),
  height: integer("height"),
  format: text("format"),
  bytes: integer("bytes"),
  version: text("version"),
  folder: text("folder"),
  resource_type: text("resource_type"),
  transformation_metadata: jsonb("transformation_metadata"),
  owner_id: uuid("owner_id").references(() => users.id),
  entity_type: entityTypeEnum("entity_type"),
  entity_id: uuid("entity_id"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
});
