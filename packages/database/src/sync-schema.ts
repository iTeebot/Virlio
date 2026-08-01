import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env.local") });

const dbUrl = (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)!;

if (!dbUrl) {
  console.error("❌ Database URL missing for sync-schema.");
  process.exit(1);
}

async function syncSchema() {
  console.log("⚡ Syncing database columns for templates & template_moderation_logs...");
  const sql = postgres(dbUrl, { prepare: false });

  try {
    // 1. Add missing columns to templates table
    await sql.unsafe(`
      ALTER TABLE templates 
      ADD COLUMN IF NOT EXISTS sha256_hash text,
      ADD COLUMN IF NOT EXISTS phash text,
      ADD COLUMN IF NOT EXISTS dhash text,
      ADD COLUMN IF NOT EXISTS ocr_text text,
      ADD COLUMN IF NOT EXISTS ocr_confidence integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS ocr_language text,
      ADD COLUMN IF NOT EXISTS quality_score integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS risk_score integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS duplicate_score integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS processing_status text DEFAULT 'UPLOADED',
      ADD COLUMN IF NOT EXISTS rejection_reason text,
      ADD COLUMN IF NOT EXISTS rejection_code text,
      ADD COLUMN IF NOT EXISTS upvotes_count integer DEFAULT 0,
      ADD COLUMN IF NOT EXISTS downloads_count integer DEFAULT 0;
    `);

    // 2. Create template_moderation_logs table if not exists
    await sql.unsafe(`
      CREATE TABLE IF NOT EXISTS template_moderation_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id uuid NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
        provider text NOT NULL,
        model text NOT NULL,
        moderation_decision text NOT NULL,
        confidence_score integer DEFAULT 0,
        quality_score integer DEFAULT 0,
        risk_score integer DEFAULT 0,
        duplicate_score integer DEFAULT 0,
        reasoning text,
        raw_ai_response jsonb,
        reviewed_by uuid REFERENCES users(id),
        created_at timestamp with time zone DEFAULT now() NOT NULL
      );
    `);

    console.log("✅ Successfully synced database columns for templates and moderation logs!");
  } catch (err: any) {
    console.error("❌ Schema sync failed:", err.message);
  } finally {
    await sql.end();
  }
}

syncSchema();
