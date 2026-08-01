const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function migrateColumns() {
  const { db } = await import("@virlio/database");
  const { sql } = await import("drizzle-orm");

  console.log("[MIGRATION] Adding lifecycle columns to users and brands tables...");

  try {
    await db.execute(sql.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_by" uuid;`));
    console.log("  ✓ Added users.deleted_by column");
  } catch (e: any) {
    console.warn("  ⚠️ users.deleted_by error:", e.message);
  }

  try {
    await db.execute(sql.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deletion_reason" text;`));
    console.log("  ✓ Added users.deletion_reason column");
  } catch (e: any) {
    console.warn("  ⚠️ users.deletion_reason error:", e.message);
  }

  try {
    await db.execute(sql.raw(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL;`));
    console.log("  ✓ Made users.email nullable");
  } catch (e: any) {
    console.warn("  ⚠️ users.email drop not null error:", e.message);
  }

  try {
    await db.execute(sql.raw(`ALTER TABLE "templates" ALTER COLUMN "uploaded_by" DROP NOT NULL;`));
    console.log("  ✓ Made templates.uploaded_by nullable");
  } catch (e: any) {
    console.warn("  ⚠️ templates.uploaded_by drop not null error:", e.message);
  }

  try {
    await db.execute(sql.raw(`ALTER TABLE "brands" ADD COLUMN IF NOT EXISTS "is_archived" boolean DEFAULT false;`));
    console.log("  ✓ Added brands.is_archived column");
  } catch (e: any) {
    console.warn("  ⚠️ brands.is_archived error:", e.message);
  }

  try {
    await db.execute(sql.raw(`ALTER TYPE "account_status" ADD VALUE IF NOT EXISTS 'deleted';`));
    console.log("  ✓ Added 'deleted' to account_status enum");
  } catch (e: any) {
    console.warn("  ⚠️ account_status enum error:", e.message);
  }

  console.log("[MIGRATION] Lifecycle columns migrated successfully.");
}

migrateColumns()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Column migration failed:", err);
    process.exit(1);
  });
