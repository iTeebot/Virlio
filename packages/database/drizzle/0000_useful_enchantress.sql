CREATE TYPE "public"."account_status" AS ENUM('active', 'suspended', 'banned', 'deactivated');--> statement-breakpoint
CREATE TYPE "public"."account_type" AS ENUM('personal', 'business', 'agency');--> statement-breakpoint
CREATE TYPE "public"."activity_type" AS ENUM('joined', 'brand_created', 'brand_verified', 'meme_generated', 'template_uploaded', 'template_approved', 'template_rejected', 'badge_earned', 'achievement_unlocked', 'level_up', 'streak_milestone', 'followed_user', 'followed_brand');--> statement-breakpoint
CREATE TYPE "public"."badge_category" AS ENUM('contribution', 'streak', 'engagement', 'moderation', 'special');--> statement-breakpoint
CREATE TYPE "public"."brand_role" AS ENUM('owner', 'manager', 'editor');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('user', 'brand', 'template', 'meme', 'comment');--> statement-breakpoint
CREATE TYPE "public"."moderation_status" AS ENUM('pending', 'approved', 'rejected', 'flagged');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('system', 'moderation', 'achievement', 'follower', 'comment', 'vote', 'report', 'verification', 'brand_update', 'ai_recommendation');--> statement-breakpoint
CREATE TYPE "public"."report_reason" AS ENUM('spam', 'duplicate', 'nudity', 'violence', 'illegal', 'copyright', 'harassment', 'hate_speech', 'misinformation', 'other');--> statement-breakpoint
CREATE TYPE "public"."report_status" AS ENUM('pending', 'reviewed', 'resolved', 'dismissed');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('user', 'contributor', 'brand_owner', 'moderator', 'admin');--> statement-breakpoint
CREATE TYPE "public"."streak_category" AS ENUM('login', 'meme_generation', 'template_upload', 'community_contribution', 'moderation', 'engagement');--> statement-breakpoint
CREATE TYPE "public"."verification_status" AS ENUM('pending', 'verified', 'rejected', 'suspended');--> statement-breakpoint
CREATE TYPE "public"."visibility" AS ENUM('public', 'private', 'unlisted');--> statement-breakpoint
CREATE TYPE "public"."vote_type" AS ENUM('upvote', 'downvote');--> statement-breakpoint
CREATE TABLE "accounts" (
	"userId" uuid NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" text,
	"scope" text,
	"id_token" text,
	"session_state" text,
	CONSTRAINT "accounts_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"sessionToken" text PRIMARY KEY NOT NULL,
	"userId" uuid NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp with time zone,
	"image" text,
	"username" text,
	"display_name" text,
	"bio" text,
	"avatar_url" text,
	"banner_url" text,
	"website" text,
	"country" text,
	"language" text,
	"timezone" text,
	"public_profile" boolean DEFAULT true,
	"profile_visibility" "visibility" DEFAULT 'public',
	"account_status" "account_status" DEFAULT 'active',
	"account_type" "account_type" DEFAULT 'personal',
	"role" "role" DEFAULT 'user',
	"last_seen_at" timestamp with time zone,
	"onboarding_completed" boolean DEFAULT false,
	"contributor_score" integer DEFAULT 0,
	"trust_score" integer DEFAULT 0,
	"ai_reputation_score" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" text NOT NULL,
	"token" text NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
CREATE TABLE "brand_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "brand_role" NOT NULL,
	"invited_by" uuid,
	"accepted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"legal_name" text,
	"description" text,
	"logo_url" text,
	"banner_url" text,
	"logo_public_id" text,
	"banner_public_id" text,
	"website" text,
	"industry" text,
	"sub_industry" text,
	"country" text,
	"language" text,
	"timezone" text,
	"verification_status" "verification_status" DEFAULT 'pending',
	"verification_reason" text,
	"verification_date" timestamp with time zone,
	"verified_by" uuid,
	"ai_confidence_score" integer DEFAULT 0,
	"digital_presence_score" integer DEFAULT 0,
	"brand_score" integer DEFAULT 0,
	"visibility" "visibility" DEFAULT 'public',
	"allow_public_generation" boolean DEFAULT true,
	"allow_public_profile" boolean DEFAULT true,
	"contact_email" text,
	"support_email" text,
	"social_links" jsonb,
	"address" jsonb,
	"settings" jsonb,
	"metadata" jsonb,
	"owner_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" text,
	"subcategory" text,
	"language" text,
	"country" text,
	"tags" jsonb,
	"visibility" "visibility" DEFAULT 'public',
	"moderation_status" "moderation_status" DEFAULT 'pending',
	"approval_confidence" integer DEFAULT 0,
	"approval_metadata" jsonb,
	"original_source" text,
	"license" text,
	"ai_summary" text,
	"ai_tags" jsonb,
	"duplicate_group" text,
	"cloudinary_public_id" text,
	"cloudinary_secure_url" text,
	"image_width" integer,
	"image_height" integer,
	"image_format" text,
	"image_bytes" integer,
	"public_score" integer DEFAULT 0,
	"trending_score" integer DEFAULT 0,
	"uploaded_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "memes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"template_id" uuid,
	"generator_id" uuid NOT NULL,
	"prompt" text,
	"generated_caption" text,
	"generated_hashtags" jsonb,
	"visibility" "visibility" DEFAULT 'public',
	"cloudinary_public_id" text,
	"cloudinary_secure_url" text,
	"image_width" integer,
	"image_height" integer,
	"image_format" text,
	"image_bytes" integer,
	"generation_provider" text,
	"generation_model" text,
	"generation_cost_cents" integer,
	"generation_duration_ms" integer,
	"generation_timestamp" timestamp with time zone,
	"engagement_score" integer DEFAULT 0,
	"approval_status" "moderation_status" DEFAULT 'pending',
	"facebook_url" text,
	"instagram_url" text,
	"linkedin_url" text,
	"x_url" text,
	"tiktok_url" text,
	"publish_timestamp" timestamp with time zone,
	"schedule_timestamp" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid
);
--> statement-breakpoint
CREATE TABLE "bookmarks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "comments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"content" text NOT NULL,
	"parent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "votes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"vote_type" "vote_type" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "follows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"follower_id" uuid NOT NULL,
	"following_id" uuid NOT NULL,
	"following_type" "entity_type" NOT NULL,
	"notify" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" text,
	"target_value" integer,
	"icon_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "achievements_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"category" "badge_category",
	"level" integer DEFAULT 1,
	"icon_url" text,
	"requirements" jsonb,
	"visibility" "visibility" DEFAULT 'public',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "badges_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "brand_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "streaks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"category" "streak_category" NOT NULL,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"last_activity_date" timestamp with time zone,
	"frozen_until" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"achievement_id" uuid NOT NULL,
	"current_value" integer DEFAULT 0,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"badge_id" uuid NOT NULL,
	"unlocked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_levels" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_level" integer DEFAULT 1,
	"current_xp" integer DEFAULT 0,
	"lifetime_xp" integer DEFAULT 0,
	"next_level_xp" integer DEFAULT 100,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_levels_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "xp_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"amount" integer NOT NULL,
	"reason" text,
	"source_entity_type" "entity_type",
	"source_entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reporter_id" uuid NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" uuid NOT NULL,
	"reason" "report_reason" NOT NULL,
	"explanation" text,
	"ai_moderation_state" jsonb,
	"moderator_id" uuid,
	"moderator_notes" text,
	"status" "report_status" DEFAULT 'pending',
	"resolved_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" "activity_type" NOT NULL,
	"entity_type" "entity_type",
	"entity_id" uuid,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "notification_type" NOT NULL,
	"title" text,
	"message" text,
	"entity_type" "entity_type",
	"entity_id" uuid,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"memes_published" integer DEFAULT 0,
	"templates_count" integer DEFAULT 0,
	"followers_count" integer DEFAULT 0,
	"total_engagement" integer DEFAULT 0,
	"total_views" integer DEFAULT 0,
	"badges_earned" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brand_stats_brand_id_unique" UNIQUE("brand_id")
);
--> statement-breakpoint
CREATE TABLE "user_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"templates_uploaded" integer DEFAULT 0,
	"templates_approved" integer DEFAULT 0,
	"templates_rejected" integer DEFAULT 0,
	"memes_generated" integer DEFAULT 0,
	"followers_count" integer DEFAULT 0,
	"following_count" integer DEFAULT 0,
	"likes_received" integer DEFAULT 0,
	"bookmarks_received" integer DEFAULT 0,
	"views_count" integer DEFAULT 0,
	"badges_earned" integer DEFAULT 0,
	"achievements_unlocked" integer DEFAULT 0,
	"current_streak" integer DEFAULT 0,
	"longest_streak" integer DEFAULT 0,
	"current_xp" integer DEFAULT 0,
	"lifetime_xp" integer DEFAULT 0,
	"current_level" integer DEFAULT 1,
	"public_score" integer DEFAULT 0,
	"contributor_score" integer DEFAULT 0,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_stats_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "cloud_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"public_id" text,
	"secure_url" text,
	"width" integer,
	"height" integer,
	"format" text,
	"bytes" integer,
	"version" text,
	"folder" text,
	"resource_type" text,
	"transformation_metadata" jsonb,
	"owner_id" uuid,
	"entity_type" "entity_type",
	"entity_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "cloud_assets_public_id_unique" UNIQUE("public_id")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_members" ADD CONSTRAINT "brand_members_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_members" ADD CONSTRAINT "brand_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_members" ADD CONSTRAINT "brand_members_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_verified_by_users_id_fk" FOREIGN KEY ("verified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brands" ADD CONSTRAINT "brands_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "templates" ADD CONSTRAINT "templates_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memes" ADD CONSTRAINT "memes_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memes" ADD CONSTRAINT "memes_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memes" ADD CONSTRAINT "memes_generator_id_users_id_fk" FOREIGN KEY ("generator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memes" ADD CONSTRAINT "memes_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memes" ADD CONSTRAINT "memes_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comments" ADD CONSTRAINT "comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "follows" ADD CONSTRAINT "follows_follower_id_users_id_fk" FOREIGN KEY ("follower_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_badges" ADD CONSTRAINT "brand_badges_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_badges" ADD CONSTRAINT "brand_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "streaks" ADD CONSTRAINT "streaks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fk" FOREIGN KEY ("badge_id") REFERENCES "public"."badges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xp_events" ADD CONSTRAINT "xp_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reports" ADD CONSTRAINT "reports_moderator_id_users_id_fk" FOREIGN KEY ("moderator_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_stats" ADD CONSTRAINT "brand_stats_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_stats" ADD CONSTRAINT "user_stats_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cloud_assets" ADD CONSTRAINT "cloud_assets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_idx" ON "users" USING btree ("username") WHERE "users"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "users_email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "users_role_idx" ON "users" USING btree ("role");--> statement-breakpoint
CREATE INDEX "users_account_status_idx" ON "users" USING btree ("account_status");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_members_brand_user_idx" ON "brand_members" USING btree ("brand_id","user_id") WHERE "brand_members"."deleted_at" is null;--> statement-breakpoint
CREATE UNIQUE INDEX "brands_slug_idx" ON "brands" USING btree ("slug") WHERE "brands"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "brands_owner_id_idx" ON "brands" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "brands_industry_idx" ON "brands" USING btree ("industry");--> statement-breakpoint
CREATE INDEX "brands_verification_status_idx" ON "brands" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "brands_country_idx" ON "brands" USING btree ("country");--> statement-breakpoint
CREATE UNIQUE INDEX "templates_slug_idx" ON "templates" USING btree ("slug") WHERE "templates"."deleted_at" is null;--> statement-breakpoint
CREATE INDEX "templates_category_idx" ON "templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "templates_uploaded_by_idx" ON "templates" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "templates_moderation_status_idx" ON "templates" USING btree ("moderation_status");--> statement-breakpoint
CREATE INDEX "templates_trending_score_idx" ON "templates" USING btree ("trending_score");--> statement-breakpoint
CREATE INDEX "memes_brand_id_idx" ON "memes" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "memes_template_id_idx" ON "memes" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "memes_generator_id_idx" ON "memes" USING btree ("generator_id");--> statement-breakpoint
CREATE INDEX "memes_visibility_idx" ON "memes" USING btree ("visibility");--> statement-breakpoint
CREATE INDEX "memes_engagement_score_idx" ON "memes" USING btree ("engagement_score");--> statement-breakpoint
CREATE UNIQUE INDEX "bookmarks_entity_user_idx" ON "bookmarks" USING btree ("entity_type","entity_id","user_id");--> statement-breakpoint
CREATE INDEX "bookmarks_entity_idx" ON "bookmarks" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "bookmarks_user_idx" ON "bookmarks" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "votes_entity_user_idx" ON "votes" USING btree ("entity_type","entity_id","user_id");--> statement-breakpoint
CREATE INDEX "votes_entity_idx" ON "votes" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "votes_user_idx" ON "votes" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "follows_follower_following_idx" ON "follows" USING btree ("follower_id","following_id","following_type");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_badges_brand_badge_idx" ON "brand_badges" USING btree ("brand_id","badge_id");--> statement-breakpoint
CREATE UNIQUE INDEX "streaks_user_category_idx" ON "streaks" USING btree ("user_id","category");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_user_achievement_idx" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_badges_user_badge_idx" ON "user_badges" USING btree ("user_id","badge_id");--> statement-breakpoint
CREATE INDEX "reports_entity_idx" ON "reports" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "reports_reporter_idx" ON "reports" USING btree ("reporter_id");--> statement-breakpoint
CREATE INDEX "reports_status_idx" ON "reports" USING btree ("status");--> statement-breakpoint
CREATE INDEX "activities_user_idx" ON "activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "notifications_user_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_at_idx" ON "notifications" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");