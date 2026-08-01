import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../apps/web/.env.local") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env.local") });

const dbUrl = (process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL)!;

if (!dbUrl) {
  console.error("❌ Database URL missing.");
  process.exit(1);
}

const targetSlug = process.argv[2] || "futuristic-city-meme-template-ms9atqx8";

async function main() {
  console.log(`Soft deleting template with slug or search term matching: "${targetSlug}"...`);
  const client = postgres(dbUrl, { prepare: false });

  try {
    const updated = await client`
      UPDATE templates
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE slug ILIKE ${`%${targetSlug}%`} OR title ILIKE ${`%${targetSlug}%`}
      RETURNING id, title, slug, deleted_at;
    `;

    if (updated.length === 0) {
      console.log(`⚠️ No matching active template found for "${targetSlug}".`);
    } else {
      console.log("✅ Successfully soft-deleted matching template(s):");
      updated.forEach((t) => console.log(`  - [ID: ${t.id}] "${t.title}" (${t.slug})`));
    }
  } catch (err: any) {
    console.error("❌ Delete failed:", err.message);
  } finally {
    await client.end();
  }
}

main();
