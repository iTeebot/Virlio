ALTER TYPE "public"."brand_role" ADD VALUE 'admin' BEFORE 'manager';--> statement-breakpoint
ALTER TYPE "public"."brand_role" ADD VALUE 'content_creator';--> statement-breakpoint
ALTER TYPE "public"."brand_role" ADD VALUE 'viewer';--> statement-breakpoint
CREATE TABLE "brand_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"action" text NOT NULL,
	"details" jsonb,
	"ip_address" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_step" integer DEFAULT 1 NOT NULL,
	"step_data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_invitations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"email" text,
	"username" text,
	"role" "brand_role" NOT NULL,
	"token" text NOT NULL,
	"invited_by" uuid NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_knowledge_bases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"identity" jsonb,
	"products_services" jsonb,
	"audience" jsonb,
	"brand_voice" jsonb,
	"restrictions" jsonb,
	"faqs" jsonb,
	"campaigns" jsonb,
	"hashtags_approved" jsonb,
	"hashtags_blocked" jsonb,
	"competitors" jsonb,
	"keywords" jsonb,
	"preferred_ctas" jsonb,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_taxonomies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" text NOT NULL,
	"parent_value" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"suggested_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "brand_verifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"confidence_score" integer DEFAULT 0 NOT NULL,
	"status" "verification_status" DEFAULT 'pending' NOT NULL,
	"reasons" jsonb,
	"recommendations" jsonb,
	"evidence_data" jsonb,
	"dns_token" text,
	"meta_tag_token" text,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "template_moderation_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"model" text NOT NULL,
	"moderation_decision" text NOT NULL,
	"confidence_score" integer DEFAULT 0,
	"quality_score" integer DEFAULT 0,
	"risk_score" integer DEFAULT 0,
	"duplicate_score" integer DEFAULT 0,
	"reasoning" text,
	"raw_ai_response" jsonb,
	"reviewed_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "sha256_hash" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "phash" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "dhash" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "original_sha256" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "canonical_image_sha256" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "perceptual_hash" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "embedding_reference" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "duplicate_status" text DEFAULT 'unique';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "duplicate_of_template_id" uuid;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "duplicate_confidence" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "duplicate_checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "fingerprint_version" text DEFAULT 'v1';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_title_hint" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_description_hint" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_category_hint" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_subcategory_hint" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_tags_hint" jsonb;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_language_hint" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "user_country_hint" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "ocr_text" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "ocr_confidence" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "ocr_language" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "quality_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "risk_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "duplicate_score" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "processing_status" text DEFAULT 'UPLOADED';--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "rejection_reason" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "rejection_code" text;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "upvotes_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN "downloads_count" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "brand_audit_logs" ADD CONSTRAINT "brand_audit_logs_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_audit_logs" ADD CONSTRAINT "brand_audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_drafts" ADD CONSTRAINT "brand_drafts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_invitations" ADD CONSTRAINT "brand_invitations_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_invitations" ADD CONSTRAINT "brand_invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_knowledge_bases" ADD CONSTRAINT "brand_knowledge_bases_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_taxonomies" ADD CONSTRAINT "brand_taxonomies_suggested_by_users_id_fk" FOREIGN KEY ("suggested_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_verifications" ADD CONSTRAINT "brand_verifications_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_moderation_logs" ADD CONSTRAINT "template_moderation_logs_template_id_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_moderation_logs" ADD CONSTRAINT "template_moderation_logs_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_audit_logs_brand_idx" ON "brand_audit_logs" USING btree ("brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_drafts_user_idx" ON "brand_drafts" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_invitations_token_idx" ON "brand_invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "brand_invitations_brand_idx" ON "brand_invitations" USING btree ("brand_id");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_kb_brand_idx" ON "brand_knowledge_bases" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "brand_taxonomies_category_idx" ON "brand_taxonomies" USING btree ("category");--> statement-breakpoint
CREATE INDEX "brand_taxonomies_status_idx" ON "brand_taxonomies" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "brand_verifications_brand_idx" ON "brand_verifications" USING btree ("brand_id");--> statement-breakpoint
CREATE INDEX "template_moderation_logs_template_idx" ON "template_moderation_logs" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "template_moderation_logs_decision_idx" ON "template_moderation_logs" USING btree ("moderation_decision");--> statement-breakpoint
CREATE INDEX "templates_sha256_idx" ON "templates" USING btree ("sha256_hash");--> statement-breakpoint
CREATE INDEX "templates_phash_idx" ON "templates" USING btree ("phash");--> statement-breakpoint
CREATE INDEX "templates_original_sha256_idx" ON "templates" USING btree ("original_sha256");--> statement-breakpoint
CREATE INDEX "templates_canonical_sha256_idx" ON "templates" USING btree ("canonical_image_sha256");--> statement-breakpoint
CREATE INDEX "templates_perceptual_hash_idx" ON "templates" USING btree ("perceptual_hash");--> statement-breakpoint
CREATE INDEX "templates_duplicate_status_idx" ON "templates" USING btree ("duplicate_status");