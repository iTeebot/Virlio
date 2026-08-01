ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "original_sha256" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "canonical_image_sha256" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "perceptual_hash" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "embedding_reference" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "duplicate_status" text DEFAULT 'unique';
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "duplicate_of_template_id" uuid;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "duplicate_confidence" integer DEFAULT 0;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "duplicate_checked_at" timestamp with time zone;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "fingerprint_version" text DEFAULT 'v1';
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "user_title_hint" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "user_description_hint" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "user_category_hint" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "user_subcategory_hint" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "user_tags_hint" jsonb;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "user_language_hint" text;
--> statement-breakpoint
ALTER TABLE "templates" ADD COLUMN IF NOT EXISTS "user_country_hint" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "templates_original_sha256_idx" ON "templates" ("original_sha256");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "templates_canonical_sha256_idx" ON "templates" ("canonical_image_sha256");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "templates_perceptual_hash_idx" ON "templates" ("perceptual_hash");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "templates_duplicate_status_idx" ON "templates" ("duplicate_status");
