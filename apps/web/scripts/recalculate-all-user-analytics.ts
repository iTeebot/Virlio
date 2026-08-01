/**
 * Idempotent DB Repair Script: Recalculates all User Analytics, XP, Achievements, Trust Scores, and Badges
 * Run with: npx tsx scripts/recalculate-all-user-analytics.ts
 */
import { userAnalyticsEngine } from "../src/server/services/xp-engine.service";

async function run() {
  console.log("[XP Engine] Starting idempotent user analytics repair and recalculation...");
  const result = await userAnalyticsEngine.batchRecalculateAllUsers();
  console.log(`[XP Engine] Repair Complete! Repaired ${result.repaired} of ${result.totalUsers} users.`);
  process.exit(0);
}

run().catch((err) => {
  console.error("[XP Engine Repair Error]:", err);
  process.exit(1);
});
