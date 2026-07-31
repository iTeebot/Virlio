import { pgTable, text, timestamp, uuid, uniqueIndex, index } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { entityTypeEnum, voteTypeEnum } from "./enums";

export const votes = pgTable("votes", {
  id: uuid("id").primaryKey().defaultRandom(),
  entity_type: entityTypeEnum("entity_type").notNull(),
  entity_id: uuid("entity_id").notNull(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  vote_type: voteTypeEnum("vote_type").notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  voteUniqueIdx: uniqueIndex("votes_entity_user_idx").on(table.entity_type, table.entity_id, table.user_id),
  voteEntityIdx: index("votes_entity_idx").on(table.entity_type, table.entity_id),
  voteUserIdx: index("votes_user_idx").on(table.user_id),
}));

export const bookmarks = pgTable("bookmarks", {
  id: uuid("id").primaryKey().defaultRandom(),
  entity_type: entityTypeEnum("entity_type").notNull(),
  entity_id: uuid("entity_id").notNull(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  bookmarkUniqueIdx: uniqueIndex("bookmarks_entity_user_idx").on(table.entity_type, table.entity_id, table.user_id),
  bookmarkEntityIdx: index("bookmarks_entity_idx").on(table.entity_type, table.entity_id),
  bookmarkUserIdx: index("bookmarks_user_idx").on(table.user_id),
}));

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  entity_type: entityTypeEnum("entity_type").notNull(),
  entity_id: uuid("entity_id").notNull(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parent_id: uuid("parent_id"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
}, (table) => ({
  // manual foreign key setup if needed, for self ref
}));
