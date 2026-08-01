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

async function main() {
  console.log("🧹 Hard deleting ALL existing templates and associated moderation logs...");
  const client = postgres(dbUrl, { prepare: false });

  try {
    // 1. Delete moderation logs
    await client`DELETE FROM template_moderation_logs;`;
    
    // 2. Unlink memes referencing templates
    await client`UPDATE memes SET template_id = NULL;`;
    
    // 3. Delete template cloud assets
    await client`DELETE FROM cloud_assets WHERE entity_type = 'template';`;

    // 4. Hard delete all templates
    const deletedTemplates = await client`DELETE FROM templates RETURNING id, title, slug;`;

    console.log(`\n✅ Hard deleted ALL ${deletedTemplates.length} existing template(s) from database:`);
    deletedTemplates.forEach((t) => console.log(`  - [ID: ${t.id}] "${t.title}" (${t.slug})`));
    console.log("\nTemplate database is now 100% clean and empty!");
  } catch (err: any) {
    console.error("❌ Hard delete failed:", err.message);
  } finally {
    await client.end();
  }
}

main();
