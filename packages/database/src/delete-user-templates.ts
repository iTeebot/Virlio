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

const targetUsername = process.argv[2] || "iqraafza";

async function main() {
  console.log(`Searching for user with username or name matching: "${targetUsername}"...`);
  const client = postgres(dbUrl, { prepare: false });

  try {
    const matchingUsers = await client`
      SELECT id, username, email, name FROM users
      WHERE username ILIKE ${`%${targetUsername}%`} OR email ILIKE ${`%${targetUsername}%`} OR name ILIKE ${`%${targetUsername}%`}
    `;

    if (matchingUsers.length === 0) {
      console.log(`⚠️ No user found matching "${targetUsername}".`);
      return;
    }

    const userIds = matchingUsers.map((u) => u.id);
    console.log(`Found ${matchingUsers.length} matching user(s):`, matchingUsers);

    const deleted = await client`
      UPDATE templates
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE uploaded_by = ANY(${userIds})
      RETURNING id, title, slug, uploaded_by;
    `;

    console.log(`\n✅ Soft-deleted ${deleted.length} template(s) uploaded by user "${targetUsername}":`);
    deleted.forEach((t) => console.log(`  - [ID: ${t.id}] "${t.title}" (${t.slug})`));
  } catch (err: any) {
    console.error("❌ Failed to delete user templates:", err.message);
  } finally {
    await client.end();
  }
}

main();
