const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runConsistencyTest() {
  const { userStatsEngine } = await import("../src/server/services/user-stats-engine.service");
  const { userAnalyticsEngine } = await import("../src/server/services/xp-engine.service");
  const { activityEngine } = await import("../src/server/services/activity-engine.service");
  const { db } = await import("@virlio/database");
  const { users } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");

  console.log("=========================================");
  console.log("[TEST] Activity Engine Consistency Suite");
  console.log("=========================================");

  let testUser = await db.query.users.findFirst({
    where: eq(users.username, "ateebnoone"),
  });

  if (!testUser) {
    testUser = await db.query.users.findFirst();
  }

  if (!testUser || !testUser.id) {
    console.error("❌ No user found for consistency test.");
    process.exit(1);
  }

  const userId = testUser.id;
  console.log(`Testing user: @${testUser.username || testUser.name} (${userId})`);

  const [userStats, xpAnalytics, activityStats] = await Promise.all([
    userStatsEngine.getUserStatistics(userId),
    userAnalyticsEngine.recalculateUserAnalytics(userId),
    activityEngine.getUserActivityStats(userId),
  ]);

  let pass = true;

  console.log("\n--- Test 1: Current Streak Synchronization ---");
  console.log(`UserStatsEngine Current Streak: ${userStats.currentStreak}`);
  console.log(`XPAnalyticsEngine Current Streak: ${xpAnalytics.currentStreak}`);
  console.log(`ActivityEngine Current Streak: ${activityStats.currentStreak}`);

  if (
    userStats.currentStreak === xpAnalytics.currentStreak &&
    xpAnalytics.currentStreak === activityStats.currentStreak
  ) {
    console.log("✅ PASS: Current streak is 100% synchronized across all engines.");
  } else {
    console.error("❌ FAIL: Streak values mismatch between engines!");
    pass = false;
  }

  console.log("\n--- Test 2: Longest Streak Synchronization ---");
  console.log(`UserStatsEngine Longest Streak: ${userStats.longestStreak}`);
  console.log(`XPAnalyticsEngine Longest Streak: ${xpAnalytics.longestStreak}`);
  console.log(`ActivityEngine Longest Streak: ${activityStats.longestStreak}`);

  if (
    userStats.longestStreak === xpAnalytics.longestStreak &&
    xpAnalytics.longestStreak === activityStats.longestStreak
  ) {
    console.log("✅ PASS: Longest streak is 100% synchronized across all engines.");
  } else {
    console.error("❌ FAIL: Longest streak values mismatch!");
    pass = false;
  }

  console.log("\n--- Test 3: Contribution Calendar Integrity ---");
  const calendarKeys = Object.keys(userStats.contributionCalendar || {});
  console.log(`Active Calendar Days Count: ${userStats.activeDays}`);
  console.log(`Total Contributions Count: ${userStats.totalContributions}`);
  console.log(`Calendar Days Present: ${calendarKeys.length}`);

  if (userStats.activeDays === calendarKeys.length) {
    console.log("✅ PASS: Active days matches contribution calendar keys.");
  } else {
    console.error("❌ FAIL: Active days mismatch!");
    pass = false;
  }

  console.log("\n--- Test 4: Activity Timeline Human Readability ---");
  const timeline = userStats.timeline || [];
  console.log(`Timeline Entries Found: ${timeline.length}`);

  let hasGenericLabel = false;
  for (const entry of timeline) {
    if (entry.label === "PLATFORM_EVENT") {
      hasGenericLabel = true;
    }
  }

  if (!hasGenericLabel && timeline.length > 0) {
    console.log("✅ PASS: All timeline entries have human-readable labels.");
    console.log("Sample Timeline Entries:");
    timeline.slice(0, 3).forEach((t) => {
      console.log(`  • [${t.label}] (${new Date(t.created_at).toISOString().split("T")[0]})`);
    });
  } else if (timeline.length === 0) {
    console.log("⚠️ WARNING: Timeline is empty.");
  } else {
    console.error("❌ FAIL: Found generic PLATFORM_EVENT label in timeline!");
    pass = false;
  }

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL ACTIVITY ENGINE CONSISTENCY TESTS PASSED!");
  } else {
    console.error("❌ CONSISTENCY TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runConsistencyTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Fatal Test Error:", err);
    process.exit(1);
  });
