import { pgTable, text, timestamp, boolean, integer, uuid, uniqueIndex, index, jsonb } from "drizzle-orm/pg-core";
import { isNull } from "drizzle-orm";
import { users } from "./auth";
import { verificationStatusEnum, visibilityEnum, brandRoleEnum } from "./enums";

export const brands = pgTable("brands", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  legal_name: text("legal_name"),
  description: text("description"),
  logo_url: text("logo_url"),
  banner_url: text("banner_url"),
  logo_public_id: text("logo_public_id"),
  banner_public_id: text("banner_public_id"),
  website: text("website"),
  industry: text("industry"),
  sub_industry: text("sub_industry"),
  country: text("country"),
  language: text("language"),
  timezone: text("timezone"),
  verification_status: verificationStatusEnum("verification_status").default("pending"),
  verification_reason: text("verification_reason"),
  verification_date: timestamp("verification_date", { mode: "date", withTimezone: true }),
  verified_by: uuid("verified_by").references(() => users.id),
  ai_confidence_score: integer("ai_confidence_score").default(0),
  digital_presence_score: integer("digital_presence_score").default(0),
  brand_score: integer("brand_score").default(0),
  visibility: visibilityEnum("visibility").default("public"),
  allow_public_generation: boolean("allow_public_generation").default(true),
  allow_public_profile: boolean("allow_public_profile").default(true),
  contact_email: text("contact_email"),
  support_email: text("support_email"),
  social_links: jsonb("social_links"),
  address: jsonb("address"),
  settings: jsonb("settings"),
  metadata: jsonb("metadata"),
  owner_id: uuid("owner_id").notNull().references(() => users.id),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  created_by: uuid("created_by").references(() => users.id),
  updated_by: uuid("updated_by").references(() => users.id),
}, (table) => ({
  slugIdx: uniqueIndex("brands_slug_idx").on(table.slug).where(isNull(table.deleted_at)),
  ownerIdx: index("brands_owner_id_idx").on(table.owner_id),
  industryIdx: index("brands_industry_idx").on(table.industry),
  verificationIdx: index("brands_verification_status_idx").on(table.verification_status),
  countryIdx: index("brands_country_idx").on(table.country),
}));

export const brandMembers = pgTable("brand_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  user_id: uuid("user_id").notNull().references(() => users.id),
  role: brandRoleEnum("role").notNull(),
  invited_by: uuid("invited_by").references(() => users.id),
  accepted_at: timestamp("accepted_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
}, (table) => ({
  brandUserIdx: uniqueIndex("brand_members_brand_user_idx").on(table.brand_id, table.user_id).where(isNull(table.deleted_at)),
}));
