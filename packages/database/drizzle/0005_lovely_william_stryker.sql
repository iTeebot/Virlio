CREATE TABLE "brand_ai_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"brand_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"knowledge_base" jsonb NOT NULL,
	"change_summary" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "brands" ADD COLUMN "whatsapp_phone" text;--> statement-breakpoint
ALTER TABLE "brand_ai_history" ADD CONSTRAINT "brand_ai_history_brand_id_brands_id_fk" FOREIGN KEY ("brand_id") REFERENCES "public"."brands"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "brand_ai_history" ADD CONSTRAINT "brand_ai_history_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "brand_ai_history_brand_idx" ON "brand_ai_history" USING btree ("brand_id");