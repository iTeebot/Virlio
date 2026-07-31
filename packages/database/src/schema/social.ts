import { pgTable, timestamp, boolean, uuid, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { entityTypeEnum } from "./enums";

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
