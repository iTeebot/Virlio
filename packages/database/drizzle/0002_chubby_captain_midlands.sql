ALTER TYPE "public"."account_status" ADD VALUE 'pending' BEFORE 'active';--> statement-breakpoint
ALTER TYPE "public"."account_status" ADD VALUE 'deleted';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'brand_updated' BEFORE 'meme_generated';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'brand_rejected' BEFORE 'meme_generated';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'meme_published' BEFORE 'template_uploaded';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'meme_deleted' BEFORE 'template_uploaded';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'template_deleted' BEFORE 'badge_earned';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'profile_completed';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'profile_updated';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'team_member_added';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'team_member_removed';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'social_account_connected';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'email_verified';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'phone_verified';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'website_verified';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'google_business_connected';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'catalog_uploaded';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'store_photo_uploaded';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'document_uploaded';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'template_upvoted';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'template_downvoted';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'meme_upvoted';--> statement-breakpoint
ALTER TYPE "public"."activity_type" ADD VALUE 'meme_downvoted';--> statement-breakpoint
CREATE TABLE "meme_generations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"topic" text NOT NULL,
	"campaign_name" text,
	"target_audience" text,
	"marketing_goal" text,
	"tone" text,
	"cta" text,
	"additional_notes" text,
	"meme_count" integer DEFAULT 4 NOT NULL,
	"provider_used" text,
	"model_used" text,
	"generation_time_ms" integer,
	"total_tokens" integer,
	"prompt_version" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "templates" ALTER COLUMN "uploaded_by" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "marketing_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "marketing_opt_in_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deleted_by" uuid;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "deletion_reason" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "is_archived" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "text_layout" text DEFAULT 'top_bottom';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "ai_generation_profile" jsonb;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "generation_id" uuid;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "prompt_version" text;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "top_text" text;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "bottom_text" text;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "text_layout" text DEFAULT 'top_bottom';--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "ai_confidence" integer;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "ai_reasoning" text;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "ai_tone" text;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "status" text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "retry_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "fallback_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "token_usage" integer;--> statement-breakpoint
ALTER TABLE "memes" ADD COLUMN "watermark_enabled" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "meme_generations" ADD CONSTRAINT "meme_generations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meme_generations" ADD CONSTRAINT "meme_generations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "meme_gen_brand_id_idx" ON "meme_generations" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "meme_gen_user_id_idx" ON "meme_generations" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "meme_gen_status_idx" ON "meme_generations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "memes_generation_id_idx" ON "memes" USING btree ("generation_id");--> statement-breakpoint
CREATE INDEX "memes_status_idx" ON "memes" USING btree ("status");