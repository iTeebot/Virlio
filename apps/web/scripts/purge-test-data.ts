const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function purge() {
  const { db } = await import("@virlio/database");
  const {
    templates,
    memes,
    memeGenerations,
    brands,
    users,
    activities,
    userStats,
    streaks,
    userBadges,
    userAchievements,
    xpEvents,
    userLevels,
    brandMembers,
    brandKnowledgeBases
  } = await import("@virlio/database/schema");
  const { eq, like, inArray, or } = await import("drizzle-orm");

  console.log("Purging all test and placeholder data...");

  // 1. Delete public test/draft meme with no image/text
  const emptyMemeId = "51fced94-ad06-48de-be17-1056944ec978";
  await db.delete(memes).where(eq(memes.id, emptyMemeId)).catch(() => null);
  console.log("Purged empty public test/draft meme.");

  // 2. Find test users
  const testUsersList = await db.query.users.findMany({
    where: or(
      like(users.email, "%_test_%@virlio.test"),
      like(users.username, "meme_test_%")
    )
  });

  if (testUsersList.length > 0) {
    const userIds = testUsersList.map((u) => u.id);
    console.log(`Found ${userIds.length} test users to purge. IDs:`, userIds);

    // Find test brands owned by these test users
    const testBrandsList = await db.query.brands.findMany({
      where: inArray(brands.owner_id, userIds)
    });
    const brandIds = testBrandsList.map((b) => b.id);

    if (brandIds.length > 0) {
      console.log(`Found ${brandIds.length} test brands to delete. IDs:`, brandIds);
      
      // Delete memes belonging to these brands
      await db.delete(memes).where(inArray(memes.brand_id, brandIds)).catch((e) => console.log("Meme delete warning:", e.message));
      // Delete generations
      await db.delete(memeGenerations).where(inArray(memeGenerations.brand_id, brandIds)).catch((e) => console.log("Gen delete warning:", e.message));
      // Delete brand members
      await db.delete(brandMembers).where(inArray(brandMembers.brand_id, brandIds)).catch((e) => console.log("BrandMembers delete warning:", e.message));
      // Delete brand knowledge base
      await db.delete(brandKnowledgeBases).where(inArray(brandKnowledgeBases.brand_id, brandIds)).catch((e) => console.log("KnowledgeBase delete warning:", e.message));
      // Delete brands
      await db.delete(brands).where(inArray(brands.id, brandIds)).catch((e) => console.log("Brand delete warning:", e.message));
    }

    // Delete dependent tables of users
    await db.delete(activities).where(inArray(activities.user_id, userIds)).catch((e) => console.log("Activity delete warning:", e.message));
    await db.delete(userStats).where(inArray(userStats.user_id, userIds)).catch((e) => console.log("UserStats delete warning:", e.message));
    await db.delete(streaks).where(inArray(streaks.user_id, userIds)).catch((e) => console.log("Streaks delete warning:", e.message));
    await db.delete(userBadges).where(inArray(userBadges.user_id, userIds)).catch((e) => console.log("Badges delete warning:", e.message));
    await db.delete(userAchievements).where(inArray(userAchievements.user_id, userIds)).catch((e) => console.log("Achievements delete warning:", e.message));
    await db.delete(xpEvents).where(inArray(xpEvents.user_id, userIds)).catch((e) => console.log("XP delete warning:", e.message));
    await db.delete(userLevels).where(inArray(userLevels.user_id, userIds)).catch((e) => console.log("Levels delete warning:", e.message));
    await db.delete(brandMembers).where(inArray(brandMembers.user_id, userIds)).catch((e) => console.log("Members delete warning:", e.message));

    // Delete users
    await db.delete(users).where(inArray(users.id, userIds)).catch((e) => console.log("User delete warning:", e.message));
    console.log("Purge of test users and all related associations completed.");
  } else {
    console.log("No test users found.");
  }
}

purge()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Purge error:", err);
    process.exit(1);
  });
