const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function migrateEnum() {
  const { db } = await import("@virlio/database");
  const { sql } = await import("drizzle-orm");

  console.log("[MIGRATION] Adding new enum values to Postgres activity_type enum...");

  const newValues = [
    "brand_updated",
    "brand_rejected",
    "meme_published",
    "meme_deleted",
    "template_deleted",
    "profile_completed",
    "profile_updated",
    "team_member_added",
    "team_member_removed",
    "social_account_connected",
    "email_verified",
    "phone_verified",
    "website_verified",
    "google_business_connected",
    "catalog_uploaded",
    "store_photo_uploaded",
    "document_uploaded",
    "template_upvoted",
    "template_downvoted",
    "meme_upvoted",
    "meme_downvoted",
  ];

  for (const val of newValues) {
    try {
      await db.execute(sql.raw(`ALTER TYPE "activity_type" ADD VALUE IF NOT EXISTS '${val}';`));
      console.log(`  ✓ Added enum value: ${val}`);
    } catch (e: any) {
      console.warn(`  ⚠️ Could not add ${val}: ${e.message}`);
    }
  }

  console.log("[MIGRATION] Enum values updated successfully.");
}

migrateEnum()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Enum migration failed:", err);
    process.exit(1);
  });
