const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runBackfill() {
  const { db } = await import("@virlio/database");
  const { activities, brands, templates, memes, userBadges } = await import("@virlio/database/schema");
  const { eq, and } = await import("drizzle-orm");
  const { activityEngine } = await import("../src/server/services/activity-engine.service");

  async function isDuplicate(userId: string, activityType: string, entityId?: string): Promise<boolean> {
    const conditions = [
      eq(activities.user_id, userId),
      eq(activities.activity_type, activityType as any),
    ];
    if (entityId) {
      conditions.push(eq(activities.entity_id, entityId));
    }

    const existing = await db.query.activities.findFirst({
      where: and(...conditions),
    });

    return !!existing;
  }

  console.log("=========================================");
  console.log("[BACKFILL] Activity Events Migration");
  console.log("=========================================");

  const allUsers = await db.query.users.findMany();
  console.log(`[BACKFILL] Found ${allUsers.length} users to process.`);

  let totalEventsCreated = 0;
  let totalSkipped = 0;

  for (const user of allUsers) {
    if (!user.id) continue;
    const userId = user.id;
    console.log(`\n[BACKFILL] Processing user: @${user.username || user.name} (${userId})`);

    // 1. ACCOUNT_CREATED
    if (user.created_at) {
      const dup = await isDuplicate(userId, "joined");
      if (!dup) {
        await activityEngine.recordActivity(userId, "joined", "user", userId, { name: user.name }, new Date(user.created_at));
        totalEventsCreated++;
        console.log(`  ✓ joined (${new Date(user.created_at).toISOString().split("T")[0]})`);
      } else {
        totalSkipped++;
      }
    }

    // 2. BRANDS
    const userBrands = await db.query.brands.findMany({
      where: eq(brands.owner_id, userId),
    });

    for (const brand of userBrands) {
      if (brand.created_at) {
        const dup = await isDuplicate(userId, "brand_created", brand.id);
        if (!dup) {
          await activityEngine.recordActivity(userId, "brand_created", "brand", brand.id, { name: brand.name }, new Date(brand.created_at));
          totalEventsCreated++;
          console.log(`  ✓ brand_created: "${brand.name}" (${new Date(brand.created_at).toISOString().split("T")[0]})`);
        } else {
          totalSkipped++;
        }
      }

      if ((brand.verification_status || "").toLowerCase() === "verified") {
        const dup = await isDuplicate(userId, "brand_verified", brand.id);
        if (!dup) {
          const verifiedAt = brand.updated_at || brand.created_at || new Date();
          await activityEngine.recordActivity(userId, "brand_verified", "brand", brand.id, { name: brand.name }, new Date(verifiedAt));
          totalEventsCreated++;
          console.log(`  ✓ brand_verified: "${brand.name}" (${new Date(verifiedAt).toISOString().split("T")[0]})`);
        } else {
          totalSkipped++;
        }
      }
    }

    // 3. TEMPLATES
    const userTemplates = await db.query.templates.findMany({
      where: eq(templates.uploaded_by, userId),
    });

    for (const template of userTemplates) {
      if (template.created_at) {
        const dup = await isDuplicate(userId, "template_uploaded", template.id);
        if (!dup) {
          await activityEngine.recordActivity(userId, "template_uploaded", "template", template.id, { title: template.title }, new Date(template.created_at));
          totalEventsCreated++;
          console.log(`  ✓ template_uploaded: "${template.title}" (${new Date(template.created_at).toISOString().split("T")[0]})`);
        } else {
          totalSkipped++;
        }
      }

      if (template.moderation_status === "approved" && template.created_at) {
        const dup = await isDuplicate(userId, "template_approved", template.id);
        if (!dup) {
          await activityEngine.recordActivity(userId, "template_approved", "template", template.id, { title: template.title }, new Date(template.created_at));
          totalEventsCreated++;
          console.log(`  ✓ template_approved: "${template.title}"`);
        } else {
          totalSkipped++;
        }
      }
    }

    // 4. MEMES
    const userMemes = await db.query.memes.findMany({
      where: eq(memes.generator_id, userId),
    });

    for (const meme of userMemes) {
      if (meme.created_at) {
        const dup = await isDuplicate(userId, "meme_generated", meme.id);
        if (!dup) {
          await activityEngine.recordActivity(userId, "meme_generated", "meme", meme.id, { title: (meme as any).title }, new Date(meme.created_at));
          totalEventsCreated++;
          console.log(`  ✓ meme_generated (${new Date(meme.created_at).toISOString().split("T")[0]})`);
        } else {
          totalSkipped++;
        }
      }
    }

    // 5. BADGES / ACHIEVEMENTS
    const userBadgesList = await db.query.userBadges.findMany({
      where: eq(userBadges.user_id, userId),
    });

    for (const ub of userBadgesList) {
      const createdAt = (ub as any).unlocked_at || (ub as any).created_at;
      if (createdAt) {
        const dup = await isDuplicate(userId, "achievement_unlocked", ub.badge_id);
        if (!dup) {
          await activityEngine.recordActivity(userId, "achievement_unlocked", "user", ub.badge_id, {}, new Date(createdAt));
          totalEventsCreated++;
          console.log(`  ✓ achievement_unlocked (${new Date(createdAt).toISOString().split("T")[0]})`);
        } else {
          totalSkipped++;
        }
      }
    }

    // 6. EMAIL VERIFIED
    if (user.emailVerified || (user as any).email_verified) {
      const dup = await isDuplicate(userId, "email_verified");
      if (!dup) {
        const emailDate = new Date(user.emailVerified || (user as any).email_verified || user.created_at);
        await activityEngine.recordActivity(userId, "email_verified", "user", userId, { email: user.email }, emailDate);
        totalEventsCreated++;
        console.log(`  ✓ email_verified (${emailDate.toISOString().split("T")[0]})`);
      } else {
        totalSkipped++;
      }
    }

    // 7. Recalculate streaks after backfill
    const streakResult = await activityEngine.calculateStreaksFromEvents(userId);
    console.log(`  → Streak: current=${streakResult.currentStreak}, longest=${streakResult.longestStreak}`);
  }

  console.log("\n=========================================");
  console.log(`[BACKFILL] COMPLETE`);
  console.log(`  Events Created: ${totalEventsCreated}`);
  console.log(`  Duplicates Skipped: ${totalSkipped}`);
  console.log(`  Total Users: ${allUsers.length}`);
  console.log("=========================================");
}

runBackfill()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Fatal Backfill Error:", err);
    process.exit(1);
  });
