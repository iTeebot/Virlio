const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function cleanTestData() {
  const { db } = await import("@virlio/database");
  const {
    users,
    userBadges,
    verificationTokens,
    activities,
    notifications,
    userStats,
    streaks,
    follows,
    votes,
    comments,
    reports,
    xpEvents,
    userLevels,
    userAchievements,
    accounts,
    sessions,
    memes,
    templates,
    brands,
    brandMembers,
  } = await import("@virlio/database/schema");
  const { or, like, inArray, eq } = await import("drizzle-orm");

  console.log("=========================================");
  console.log("[CLEANUP] Purging test data from database...");
  console.log("=========================================");

  // Find all test users
  const testUsers = await db.query.users.findMany({
    where: or(
      like(users.email, "%@virlio.test"),
      like(users.username, "signup_user_%"),
      like(users.username, "test_user_%"),
      like(users.email, "test_%")
    ),
  });

  if (testUsers.length === 0) {
    console.log("  ✓ No test user records found in database.");
    console.log("=========================================");
    return;
  }

  const testUserIds = testUsers.map((u) => u.id);
  const testEmails = testUsers.map((u) => u.email).filter(Boolean) as string[];

  console.log(`Found ${testUsers.length} test user record(s):`, testUsers.map((u) => `@${u.username} (${u.email})`).join(", "));

  // Purge all related test data
  await Promise.all([
    db.delete(userBadges).where(inArray(userBadges.user_id, testUserIds)).catch(() => null),
    db.delete(userLevels).where(inArray(userLevels.user_id, testUserIds)).catch(() => null),
    db.delete(userAchievements).where(inArray(userAchievements.user_id, testUserIds)).catch(() => null),
    db.delete(activities).where(inArray(activities.user_id, testUserIds)).catch(() => null),
    db.delete(notifications).where(inArray(notifications.user_id, testUserIds)).catch(() => null),
    db.delete(follows).where(inArray(follows.follower_id, testUserIds)).catch(() => null),
    db.delete(votes).where(inArray(votes.user_id, testUserIds)).catch(() => null),
    db.delete(comments).where(inArray(comments.user_id, testUserIds)).catch(() => null),
    db.delete(reports).where(inArray(reports.reporter_id, testUserIds)).catch(() => null),
    db.delete(userStats).where(inArray(userStats.user_id, testUserIds)).catch(() => null),
    db.delete(streaks).where(inArray(streaks.user_id, testUserIds)).catch(() => null),
    db.delete(xpEvents).where(inArray(xpEvents.user_id, testUserIds)).catch(() => null),
    db.delete(sessions).where(inArray(sessions.userId, testUserIds)).catch(() => null),
    db.delete(accounts).where(inArray(accounts.userId, testUserIds)).catch(() => null),
    db.delete(brandMembers).where(inArray(brandMembers.user_id, testUserIds)).catch(() => null),
    db.delete(memes).where(inArray(memes.generator_id, testUserIds)).catch(() => null),
    db.delete(templates).where(inArray(templates.uploaded_by, testUserIds)).catch(() => null),
    db.delete(brands).where(inArray(brands.owner_id, testUserIds)).catch(() => null),
  ]);

  if (testEmails.length > 0) {
    await db.delete(verificationTokens).where(inArray(verificationTokens.identifier, testEmails)).catch(() => null);
  }

  // Delete test users themselves
  await db.delete(users).where(inArray(users.id, testUserIds));

  console.log(`  ✓ Successfully deleted ${testUsers.length} test user(s) and all associated records.`);
  console.log("=========================================");
}

cleanTestData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  });
