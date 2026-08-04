const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function migrate() {
  const { db } = await import("@virlio/database");
  const { sql } = await import("drizzle-orm");

  console.log("[MIGRATION] Adding password_hash column to users table...");

  try {
    await db.execute(sql.raw(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash" text;`));
    console.log("  ✓ Added users.password_hash column");
  } catch (e: any) {
    console.warn("  ⚠️ users.password_hash error:", e.message);
  }

  try {
    await db.execute(sql.raw(`ALTER TYPE "account_status" ADD VALUE IF NOT EXISTS 'pending';`));
    console.log("  ✓ Added 'pending' to account_status enum");
  } catch (e: any) {
    console.warn("  ⚠️ account_status pending enum error:", e.message);
  }

  console.log("[MIGRATION] Migration complete.");
}

migrate()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
