import { db } from "@virlio/database";
import { users, brands, templates, memes, userBadges, follows } from "@virlio/database/schema";
import { eq } from "drizzle-orm";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";

async function main() {
  const allUsers = await db.query.users.findMany();
  console.log(`=== TOTAL USERS IN DB: ${allUsers.length} ===`);

  for (const u of allUsers) {
    const stats = await userStatsEngine.getUserStatistics(u.id);
    console.log(`\nUser: ${u.name} (@${u.username}) | ID: ${u.id}`);
    console.log(`  DB contributor_score: ${u.contributor_score} | Engine XP: ${stats.xp}`);
    console.log(`  DB trust_score: ${u.trust_score} | Engine Trust: ${stats.trustScore}`);
    console.log(`  Brands owned: ${stats.brands.owned} (Verified: ${stats.brands.verified})`);
    console.log(`  Templates uploaded: ${stats.templates.total} (Approved: ${stats.templates.approved})`);
    console.log(`  Memes generated: ${stats.memes.total} (Public: ${stats.memes.public})`);
    console.log(`  Unlocked achievements: ${stats.achievements.filter(a => a.unlocked).length} / ${stats.achievements.length}`);
  }
}

main().catch(console.error);
