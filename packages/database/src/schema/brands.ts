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
  phone: text("phone"),
  whatsapp_phone: text("whatsapp_phone"),
  social_links: jsonb("social_links"),
  address: jsonb("address"),
  settings: jsonb("settings"),
  metadata: jsonb("metadata"),
  owner_id: uuid("owner_id").notNull().references(() => users.id),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  is_archived: boolean("is_archived").default(false),
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

export const brandDrafts = pgTable("brand_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  user_id: uuid("user_id").notNull().references(() => users.id),
  current_step: integer("current_step").default(1).notNull(),
  step_data: jsonb("step_data").notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userDraftIdx: uniqueIndex("brand_drafts_user_idx").on(table.user_id),
}));

export const brandKnowledgeBases = pgTable("brand_knowledge_bases", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  identity: jsonb("identity"),
  products_services: jsonb("products_services"),
  audience: jsonb("audience"),
  brand_voice: jsonb("brand_voice"),
  restrictions: jsonb("restrictions"),
  faqs: jsonb("faqs"),
  campaigns: jsonb("campaigns"),
  hashtags_approved: jsonb("hashtags_approved"),
  hashtags_blocked: jsonb("hashtags_blocked"),
  competitors: jsonb("competitors"),
  keywords: jsonb("keywords"),
  preferred_ctas: jsonb("preferred_ctas"),
  metadata: jsonb("metadata"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  brandKbIdx: uniqueIndex("brand_kb_brand_idx").on(table.brand_id),
}));

export const brandVerifications = pgTable("brand_verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  confidence_score: integer("confidence_score").default(0).notNull(),
  status: verificationStatusEnum("status").default("pending").notNull(),
  reasons: jsonb("reasons"),
  recommendations: jsonb("recommendations"),
  evidence_data: jsonb("evidence_data"),
  dns_token: text("dns_token"),
  meta_tag_token: text("meta_tag_token"),
  verified_at: timestamp("verified_at", { mode: "date", withTimezone: true }),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  brandVerifIdx: uniqueIndex("brand_verifications_brand_idx").on(table.brand_id),
}));

export const brandInvitations = pgTable("brand_invitations", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  email: text("email"),
  username: text("username"),
  role: brandRoleEnum("role").notNull(),
  token: text("token").notNull(),
  invited_by: uuid("invited_by").notNull().references(() => users.id),
  status: text("status").default("pending").notNull(),
  expires_at: timestamp("expires_at", { mode: "date", withTimezone: true }).notNull(),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tokenIdx: uniqueIndex("brand_invitations_token_idx").on(table.token),
  brandInviteIdx: index("brand_invitations_brand_idx").on(table.brand_id),
}));

export const brandAuditLogs = pgTable("brand_audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  user_id: uuid("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  details: jsonb("details"),
  ip_address: text("ip_address"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  brandAuditIdx: index("brand_audit_logs_brand_idx").on(table.brand_id),
}));

export const brandTaxonomies = pgTable("brand_taxonomies", {
  id: uuid("id").primaryKey().defaultRandom(),
  category: text("category").notNull(), // 'business_type' | 'industry' | 'sub_industry'
  parent_value: text("parent_value"),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  status: text("status").default("pending").notNull(), // 'pending' | 'approved' | 'rejected'
  suggested_by: uuid("suggested_by").references(() => users.id),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  categoryIdx: index("brand_taxonomies_category_idx").on(table.category),
  statusIdx: index("brand_taxonomies_status_idx").on(table.status),
}));

export const brandAiHistory = pgTable("brand_ai_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  brand_id: uuid("brand_id").notNull().references(() => brands.id),
  user_id: uuid("user_id").notNull().references(() => users.id),
  version: integer("version").default(1).notNull(),
  knowledge_base: jsonb("knowledge_base").notNull(),
  change_summary: text("change_summary"),
  created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  brandAiHistoryBrandIdx: index("brand_ai_history_brand_idx").on(table.brand_id),
}));



