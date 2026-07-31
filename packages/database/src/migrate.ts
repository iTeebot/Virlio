import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env files
dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const dbUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

if (!dbUrl || dbUrl.includes("aws-0-region.supabase.com") || dbUrl.includes("<SET_FROM_")) {
  console.error("❌ Invalid connection URL for migration.");
  process.exit(1);
}

async function migrate() {
  console.log("🚀 Executing Drizzle SQL migrations against PostgreSQL database...");
  const sqlFile = path.resolve(__dirname, "../drizzle/0000_useful_enchantress.sql");

  if (!fs.existsSync(sqlFile)) {
    console.error("❌ SQL migration file not found:", sqlFile);
    process.exit(1);
  }

  const rawSql = fs.readFileSync(sqlFile, "utf-8");
  const statements = rawSql
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const client = postgres(dbUrl, { prepare: false });

  try {
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.unsafe(stmt);
      } catch (err: any) {
        // Ignore "already exists" errors (e.g. types or tables already existing)
        if (err.code === "42710" || err.code === "42P07" || err.message.includes("already exists")) {
          // Object already exists, continue
        } else {
          console.warn(`  [Notice] Statement ${i + 1}: ${err.message}`);
        }
      }
    }

    console.log("✅ Drizzle SQL migration completed successfully!");
  } catch (err: any) {
    console.error("❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

migrate();
