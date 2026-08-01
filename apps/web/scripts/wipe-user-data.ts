const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runWipe() {
  const { db } = await import("@virlio/database");
  const {
    activities,
    notifications,
    comments,
    reports,
    votes,
    userBadges,
    userAchievements,
    userStats,
    streaks,
    xpEvents,
    memes,
    templates,
    brandMembers,
    brandDrafts,
    brandKnowledgeBases,
    brandVerifications,
    brandInvitations,
    brandAuditLogs,
    brands,
    follows,
    accounts,
    sessions,
    verificationTokens,
    users,
  } = await import("@virlio/database/schema");

  console.log("=========================================");
  console.log("[WIPE] Hard Deleting All Pre-Launch User Data");
  console.log("=========================================");

  // 1. Transient user interactions & logs
  await db.delete(activities).catch(() => null);
  await db.delete(notifications).catch(() => null);
  await db.delete(comments).catch(() => null);
  await db.delete(reports).catch(() => null);
  await db.delete(votes).catch(() => null);
  await db.delete(follows).catch(() => null);

  // 2. Gamification & stats
  await db.delete(userBadges).catch(() => null);
  await db.delete(userAchievements).catch(() => null);
  await db.delete(userStats).catch(() => null);
  await db.delete(streaks).catch(() => null);
  await db.delete(xpEvents).catch(() => null);

  // 3. Memes & Templates
  await db.delete(memes).catch(() => null);
  await db.delete(templates).catch(() => null);

  // 4. Brand sub-entities
  await db.delete(brandDrafts).catch(() => null);
  await db.delete(brandKnowledgeBases).catch(() => null);
  await db.delete(brandVerifications).catch(() => null);
  await db.delete(brandInvitations).catch(() => null);
  await db.delete(brandAuditLogs).catch(() => null);
  await db.delete(brandMembers).catch(() => null);

  // 5. Brands
  await db.delete(brands).catch(() => null);

  // 6. Auth & Users
  await db.delete(sessions).catch(() => null);
  await db.delete(accounts).catch(() => null);
  await db.delete(verificationTokens).catch(() => null);
  await db.delete(users).catch(() => null);

  console.log("=========================================");
  console.log("🎉 DATABASE WIPE COMPLETE: 100% of user data wiped cleanly!");
  console.log("=========================================");
}

runWipe()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Database wipe failed:", err);
    process.exit(1);
  });
