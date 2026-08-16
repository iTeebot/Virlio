import { pgTable, text, timestamp, integer, uuid, index, jsonb, boolean } from "drizzle-orm/pg-core";
import { users } from "./auth";
import { brands } from "./brands";
import { cloudAssets } from "./storage";

/**
 * 1. Brand Generation Session: Top-level creative workspace session.
 */
export const brandGenerationSessions = pgTable(
  "brand_generation_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brand_id: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id),
    title: text("title").notNull(),
    focus_type: text("focus_type").default("general").notNull(), // 'product' | 'service' | 'general' | 'campaign'
    selected_product: text("selected_product"),
    selected_service: text("selected_service"),
    target_platform: text("target_platform").default("instagram_feed").notNull(), // 'instagram_feed' | 'linkedin' | 'x' | 'story'
    aspect_ratio: text("aspect_ratio").default("1:1").notNull(), // '1:1' | '4:5' | '9:16' | '16:9'
    status: text("status").default("active").notNull(), // 'active' | 'archived' | 'completed'
    created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    deleted_at: timestamp("deleted_at", { mode: "date", withTimezone: true }),
  },
  (table) => ({
    brandIdx: index("brand_gen_sessions_brand_idx").on(table.brand_id),
    userIdx: index("brand_gen_sessions_user_idx").on(table.user_id),
    statusIdx: index("brand_gen_sessions_status_idx").on(table.status),
  })
);

/**
 * 2. Brand Post Generations: A specific generation request producing up to 4 variations.
 */
export const brandPostGenerations = pgTable(
  "brand_post_generations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    session_id: uuid("session_id").notNull().references(() => brandGenerationSessions.id, { onDelete: "cascade" }),
    brand_id: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    user_id: uuid("user_id").notNull().references(() => users.id),
    user_prompt: text("user_prompt").notNull(),
    campaign_goal: text("campaign_goal"),
    target_audience: text("target_audience"),
    tone_override: text("tone_override"),
    status: text("status").default("queued").notNull(), // 'queued' | 'processing' | 'generating' | 'completed' | 'failed'
    error_message: text("error_message"),
    provider_used: text("provider_used"),
    model_used: text("model_used"),
    generation_time_ms: integer("generation_time_ms"),
    total_tokens: integer("total_tokens"),
    estimated_cost_usd: text("estimated_cost_usd"),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("brand_post_gen_session_idx").on(table.session_id),
    brandIdx: index("brand_post_gen_brand_idx").on(table.brand_id),
    statusIdx: index("brand_post_gen_status_idx").on(table.status),
  })
);

/**
 * 3. Brand Post Variations: The 4 distinct creative concepts produced per generation.
 */
export const brandPostVariations = pgTable(
  "brand_post_variations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    generation_id: uuid("generation_id").notNull().references(() => brandPostGenerations.id, { onDelete: "cascade" }),
    session_id: uuid("session_id").notNull().references(() => brandGenerationSessions.id, { onDelete: "cascade" }),
    brand_id: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    variation_index: integer("variation_index").notNull(), // 1, 2, 3, 4
    creative_direction: text("creative_direction").notNull(), // 'product_hero' | 'lifestyle' | 'editorial' | 'bold_social'
    concept_title: text("concept_title").notNull(),
    concept_description: text("concept_description").notNull(),
    headline_text: text("headline_text"),
    body_copy: text("body_copy"),
    caption_copy: text("caption_copy"),
    hashtags: jsonb("hashtags").$type<string[]>().default([]),
    active_version_id: uuid("active_version_id"), // Pointer to latest image version
    is_selected: boolean("is_selected").default(false).notNull(),
    is_approved: boolean("is_approved").default(false).notNull(),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    genIdx: index("brand_post_variations_gen_idx").on(table.generation_id),
    sessionIdx: index("brand_post_variations_session_idx").on(table.session_id),
    variationIndexIdx: index("brand_post_variations_index_idx").on(table.generation_id, table.variation_index),
  })
);

/**
 * 4. Brand Post Image Versions: Immutable image revision history tree.
 */
export const brandPostImageVersions = pgTable(
  "brand_post_image_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variation_id: uuid("variation_id").notNull().references(() => brandPostVariations.id, { onDelete: "cascade" }),
    parent_version_id: uuid("parent_version_id"), // NULL for v1 (original generation)
    version_number: integer("version_number").notNull(), // 1, 2, 3...
    asset_id: uuid("asset_id").references(() => cloudAssets.id), // Cloudinary storage reference
    image_url: text("image_url").notNull(),
    thumbnail_url: text("thumbnail_url"),
    edit_instruction: text("edit_instruction"), // NULL for v1; describes delta for v2+
    full_generation_prompt: text("full_generation_prompt").notNull(),
    negative_prompt: text("negative_prompt"),
    seed: integer("seed"),
    aspect_ratio: text("aspect_ratio").default("1:1").notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    quality_score: integer("quality_score").default(90),
    generation_time_ms: integer("generation_time_ms"),
    created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    variationIdx: index("brand_post_img_ver_variation_idx").on(table.variation_id),
    parentIdx: index("brand_post_img_ver_parent_idx").on(table.parent_version_id),
    versionNumIdx: index("brand_post_img_ver_num_idx").on(table.variation_id, table.version_number),
  })
);

/**
 * 5. Brand Generation Memories: Layered session memory state.
 */
export const brandGenerationMemories = pgTable(
  "brand_generation_memories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    session_id: uuid("session_id").notNull().references(() => brandGenerationSessions.id, { onDelete: "cascade" }),
    brand_id: uuid("brand_id").notNull().references(() => brands.id, { onDelete: "cascade" }),
    memory_type: text("memory_type").notNull(), // 'session_goal' | 'user_preference' | 'creative_decision' | 'history_summary'
    key: text("key").notNull(),
    content: text("content").notNull(),
    structured_data: jsonb("structured_data"),
    importance_score: integer("importance_score").default(5).notNull(), // 1 - 10
    created_at: timestamp("created_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { mode: "date", withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    sessionIdx: index("brand_gen_memories_session_idx").on(table.session_id),
    brandIdx: index("brand_gen_memories_brand_idx").on(table.brand_id),
    keyIdx: index("brand_gen_memories_key_idx").on(table.session_id, table.key),
  })
);
