const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function migrateMarketingOptIn() {
  const { db } = await import("@virlio/database");
  const { sql } = await import("drizzle-orm");

  console.log("=========================================");
  console.log("[MIGRATION] Adding marketing_opt_in columns to users table...");
  console.log("=========================================");

  await db.execute(sql`
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_in" boolean DEFAULT false NOT NULL;
    ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "marketing_opt_in_at" timestamp with time zone;
  `);

  console.log("  ✓ Successfully added marketing_opt_in and marketing_opt_in_at columns.");
  console.log("=========================================");
}

migrateMarketingOptIn()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Migration failed:", err);
    process.exit(1);
  });
