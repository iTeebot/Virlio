CREATE TABLE "brand_social_connections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"account_id" text,
	"page_id" text NOT NULL,
	"page_name" text NOT NULL,
	"page_image_url" text,
	"access_token" text NOT NULL,
	"refresh_token" text,
	"scopes" jsonb,
	"expires_at" timestamp with time zone,
	"connected_by" uuid,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publishing_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meme_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"external_post_id" text NOT NULL,
	"page_id" text NOT NULL,
	"page_name" text,
	"automation_id" uuid,
	"post_url" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_by" uuid,
	"publish_type" text DEFAULT 'manual' NOT NULL,
	"status" text DEFAULT 'published' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_automation_executions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"automation_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"version_id" uuid,
	"trigger_event" text NOT NULL,
	"status" text DEFAULT 'completed' NOT NULL,
	"error_message" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brand_automation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"execution_id" uuid NOT NULL,
	"node_id" text NOT NULL,
	"level" text DEFAULT 'info' NOT NULL,
	"message" text NOT NULL,
	"payload" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_automation_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"automation_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"graph_data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "brand_automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"is_enabled" boolean DEFAULT false NOT NULL,
	"trigger_type" text DEFAULT 'meme_published' NOT NULL,
	"node_count" integer DEFAULT 2 NOT NULL,
	"run_count" integer DEFAULT 0 NOT NULL,
	"last_execution_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "brand_generation_memories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"memory_type" text NOT NULL,
	"key" text NOT NULL,
	"content" text NOT NULL,
	"structured_data" jsonb,
	"importance_score" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_generation_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"title" text NOT NULL,
	"focus_type" text DEFAULT 'general' NOT NULL,
	"selected_product" text,
	"selected_service" text,
	"target_platform" text DEFAULT 'instagram_feed' NOT NULL,
	"aspect_ratio" text DEFAULT '1:1' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brand_post_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"user_prompt" text NOT NULL,
	"campaign_goal" text,
	"target_audience" text,
	"tone_override" text,
	"status" text DEFAULT 'queued' NOT NULL,
	"error_message" text,
	"provider_used" text,
	"model_used" text,
	"generation_time_ms" integer,
	"total_tokens" integer,
	"estimated_cost_usd" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_post_image_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"variation_id" uuid NOT NULL,
	"parent_version_id" uuid,
	"version_number" integer NOT NULL,
	"asset_id" uuid,
	"image_url" text NOT NULL,
	"thumbnail_url" text,
	"edit_instruction" text,
	"full_generation_prompt" text NOT NULL,
	"negative_prompt" text,
	"seed" integer,
	"aspect_ratio" text DEFAULT '1:1' NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"quality_score" integer DEFAULT 90,
	"generation_time_ms" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_post_variations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generation_id" uuid NOT NULL,
	"session_id" uuid NOT NULL,
	"brand_id" uuid NOT NULL,
	"variation_index" integer NOT NULL,
	"creative_direction" text NOT NULL,
	"concept_title" text NOT NULL,
	"concept_description" text NOT NULL,
	"headline_text" text,
	"body_copy" text,
	"caption_copy" text,
	"hashtags" jsonb DEFAULT '[]'::jsonb,
	"active_version_id" uuid,
	"is_selected" boolean DEFAULT false NOT NULL,
	"is_approved" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brand_social_connections" ADD CONSTRAINT "brand_social_connections_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_social_connections" ADD CONSTRAINT "brand_social_connections_connected_by_users_id_fk" FOREIGN KEY ("connected_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publishing_history" ADD CONSTRAINT "publishing_history_meme_id_memes_id_fk" FOREIGN KEY ("meme_id") REFERENCES "public"."memes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publishing_history" ADD CONSTRAINT "publishing_history_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publishing_history" ADD CONSTRAINT "publishing_history_automation_id_brand_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."brand_automations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publishing_history" ADD CONSTRAINT "publishing_history_published_by_users_id_fk" FOREIGN KEY ("published_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automation_executions" ADD CONSTRAINT "brand_automation_executions_automation_id_brand_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."brand_automations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automation_executions" ADD CONSTRAINT "brand_automation_executions_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automation_executions" ADD CONSTRAINT "brand_automation_executions_version_id_brand_automation_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."brand_automation_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automation_logs" ADD CONSTRAINT "brand_automation_logs_execution_id_brand_automation_executions_id_fk" FOREIGN KEY ("execution_id") REFERENCES "public"."brand_automation_executions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automation_versions" ADD CONSTRAINT "brand_automation_versions_automation_id_brand_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "public"."brand_automations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automation_versions" ADD CONSTRAINT "brand_automation_versions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automations" ADD CONSTRAINT "brand_automations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_automations" ADD CONSTRAINT "brand_automations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_generation_memories" ADD CONSTRAINT "brand_generation_memories_session_id_brand_generation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."brand_generation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_generation_memories" ADD CONSTRAINT "brand_generation_memories_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_generation_sessions" ADD CONSTRAINT "brand_generation_sessions_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_generation_sessions" ADD CONSTRAINT "brand_generation_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_generations" ADD CONSTRAINT "brand_post_generations_session_id_brand_generation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."brand_generation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_generations" ADD CONSTRAINT "brand_post_generations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_generations" ADD CONSTRAINT "brand_post_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_image_versions" ADD CONSTRAINT "brand_post_image_versions_variation_id_brand_post_variations_id_fk" FOREIGN KEY ("variation_id") REFERENCES "public"."brand_post_variations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_image_versions" ADD CONSTRAINT "brand_post_image_versions_asset_id_cloud_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."cloud_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_variations" ADD CONSTRAINT "brand_post_variations_generation_id_brand_post_generations_id_fk" FOREIGN KEY ("generation_id") REFERENCES "public"."brand_post_generations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_variations" ADD CONSTRAINT "brand_post_variations_session_id_brand_generation_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."brand_generation_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_post_variations" ADD CONSTRAINT "brand_post_variations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_social_conn_brand_platform_idx" ON "brand_social_connections" USING btree ("brand_id","platform");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_social_conn_brand_page_idx" ON "brand_social_connections" USING btree ("brand_id","platform","page_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pub_history_meme_platform_page_idx" ON "publishing_history" USING btree ("meme_id","platform","page_id");--> statement-breakpoint
CREATE INDEX "pub_history_brand_platform_idx" ON "publishing_history" USING btree ("brand_id","platform");--> statement-breakpoint
CREATE INDEX "brand_automation_exec_automation_id_idx" ON "brand_automation_executions" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "brand_automation_exec_brand_id_idx" ON "brand_automation_executions" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brand_automation_exec_status_idx" ON "brand_automation_executions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brand_automation_logs_execution_id_idx" ON "brand_automation_logs" USING btree ("execution_id");--> statement-breakpoint
CREATE INDEX "brand_automation_versions_automation_id_idx" ON "brand_automation_versions" USING btree ("automation_id");--> statement-breakpoint
CREATE INDEX "brand_automations_brand_id_idx" ON "brand_automations" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brand_automations_status_idx" ON "brand_automations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brand_automations_is_enabled_idx" ON "brand_automations" USING btree ("is_enabled");--> statement-breakpoint
CREATE INDEX "brand_gen_memories_session_idx" ON "brand_generation_memories" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "brand_gen_memories_brand_idx" ON "brand_generation_memories" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brand_gen_memories_key_idx" ON "brand_generation_memories" USING btree ("session_id","key");--> statement-breakpoint
CREATE INDEX "brand_gen_sessions_brand_idx" ON "brand_generation_sessions" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brand_gen_sessions_user_idx" ON "brand_generation_sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "brand_gen_sessions_status_idx" ON "brand_generation_sessions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brand_post_gen_session_idx" ON "brand_post_generations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "brand_post_gen_brand_idx" ON "brand_post_generations" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brand_post_gen_status_idx" ON "brand_post_generations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "brand_post_img_ver_variation_idx" ON "brand_post_image_versions" USING btree ("variation_id");--> statement-breakpoint
CREATE INDEX "brand_post_img_ver_parent_idx" ON "brand_post_image_versions" USING btree ("parent_version_id");--> statement-breakpoint
CREATE INDEX "brand_post_img_ver_num_idx" ON "brand_post_image_versions" USING btree ("variation_id","version_number");--> statement-breakpoint
CREATE INDEX "brand_post_variations_gen_idx" ON "brand_post_variations" USING btree ("generation_id");--> statement-breakpoint
CREATE INDEX "brand_post_variations_session_idx" ON "brand_post_variations" USING btree ("session_id");--> statement-breakpoint
CREATE INDEX "brand_post_variations_index_idx" ON "brand_post_variations" USING btree ("generation_id","variation_index");--> statement-breakpoint
CREATE INDEX "templates_moderation_deleted_created_idx" ON "templates" USING btree ("moderation_status","deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "templates_category_moderation_created_idx" ON "templates" USING btree ("category","moderation_status","created_at");--> statement-breakpoint
CREATE INDEX "memes_visibility_deleted_created_idx" ON "memes" USING btree ("visibility","deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "memes_brand_deleted_created_idx" ON "memes" USING btree ("brand_id","deleted_at","created_at");--> statement-breakpoint
CREATE INDEX "user_badges_user_unlocked_idx" ON "user_badges" USING btree ("user_id","unlocked_at");--> statement-breakpoint
CREATE INDEX "activities_user_created_idx" ON "activities" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_read_created_idx" ON "notifications" USING btree ("user_id","read_at","created_at");