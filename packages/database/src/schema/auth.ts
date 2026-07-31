import { pgTable, text, timestamp, boolean, integer, uuid, uniqueIndex, index, primaryKey } from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";
import { accountStatusEnum, accountTypeEnum, roleEnum, visibilityEnum } from "./enums";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date", withTimezone: true }),
  image: text("image"),
  username: text("username"),
  display_name: text("display_name"),
  bio: text("bio"),
  avatar_url: text("avatar_url"),
  banner_url: text("banner_url"),
  website: text("website"),
  country: text("country"),
  language: text("language"),
  timezone: text("timezone"),
  public_profile: boolean("public_profile").default(true),
  profile_visibility: visibilityEnum("profile_visibility").default("public"),
  account_status: accountStatusEnum("account_status").default("active"),
  account_type: accountTypeEnum("account_type").default("personal"),
  role: roleEnum("role").default("user"),
  last_seen_at: timestamp("last_seen_at", { mode: "date", withTimezone: true }),
  onboarding_completed: boolean("onboarding_completed").default(false),
  contributor_score: integer("contributor_score").default(0),
  trust_score: integer("trust_score").default(0),
  ai_reputation_score: integer("ai_reputation_score").default(0),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
}, (table) => ({
  usernameIdx: uniqueIndex("users_username_idx").on(table.username).where(isNull(table.deleted_at)),
  emailIdx: index("users_email_idx").on(table.email),
  roleIdx: index("users_role_idx").on(table.role),
  accountStatusIdx: index("users_account_status_idx").on(table.account_status),
}));

export const accounts = pgTable("accounts", {
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").$type<"oauth" | "oidc" | "email" | "webauthn">().notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("providerAccountId").notNull(),
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
}, (table) => ({
  pk: primaryKey({ columns: [table.provider, table.providerAccountId] }),
}));

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date", withTimezone: true }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.identifier, table.token] }),
}));
