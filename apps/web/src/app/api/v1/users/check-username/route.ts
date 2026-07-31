import { NextRequest } from "next/server";
import { db } from "@virlio/database";
import { streaks, votes, memes, templates, brands, activities } from "@virlio/database/schema";
import { eq, count, and, isNull, desc } from "drizzle-orm";
import { userRepository, badgeRepository, followRepository, brandRepository } from "@/server/repositories";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

function calculateUserLevelInfo(totalXp: number) {
  if (totalXp >= 10000) return { level: 6, title: "Hall of Fame Legend", minXp: 10000, maxXp: 20000 };
  if (totalXp >= 5000) return { level: 5, title: "Elite Creator", minXp: 5000, maxXp: 10000 };
  if (totalXp >= 2500) return { level: 4, title: "Master Creator", minXp: 2500, maxXp: 5000 };
  if (totalXp >= 1000) return { level: 3, title: "Pro Creator", minXp: 1000, maxXp: 2500 };
  if (totalXp >= 500) return { level: 2, title: "Rising Creator", minXp: 500, maxXp: 1000 };
  return { level: 1, title: "Novice Creator", minXp: 0, maxXp: 500 };
}

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return apiSuccess({ available: false, reason: "Username is required." });
  }

  if (username.length < 3) {
    return apiSuccess({ available: false, reason: "Username must be at least 3 characters." });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return apiSuccess({
      available: false,
      reason: "Username can only contain letters, numbers, underscores, and hyphens.",
    });
  }

  // Check database for existing username
  const existingUser = await userRepository.findByUsername(username);

  if (existingUser) {
    const userId = existingUser.id;

    // Seed Early Adopter badge for users joining before October 2026
    const cutoffDate = new Date("2026-10-01T00:00:00Z");
    if (new Date() < cutoffDate) {
      await badgeRepository.awardBadgeBySlug(userId, "early-adopter").catch(() => null);
    }

    // 1. Badges
    const userBadgesList = (await badgeRepository.findByUser(userId).catch(() => [])) || [];

    // 2. Followers & Following
    const followerCount = await followRepository.getFollowerCount(userId).catch(() => 0);
    const followingCount = await followRepository.getFollowingCount(userId).catch(() => 0);

    // 3. Streaks
    const streakRecord = await db.query.streaks
      .findFirst({ where: eq(streaks.user_id, userId) })
      .catch(() => null);

    // 4. Total Upvotes Received on User's Memes
    const upvoteRes = await db
      .select({ count: count() })
      .from(votes)
      .where(eq(votes.user_id, userId))
      .catch(() => [{ count: 0 }]);

    // 5. Brands Managed by this User
    const managedBrandsList = (await brandRepository.findByOwner(userId).catch(() => [])) || [];
    const publicBrands = managedBrandsList.map((b: any) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo_url: b.logo_url,
      description: b.description,
      industry: b.industry,
      country: b.country,
      website: b.website,
      verification_status: b.verification_status,
      brand_score: b.brand_score || 85,
    }));

    const featuredBrand = publicBrands.find((b) => b.verification_status === "verified") || publicBrands[0] || null;

    // 6. Public Memes Generated
    const publicMemes = (await db.query.memes.findMany({
      where: and(eq(memes.generator_id, userId), eq(memes.visibility, "public")),
      limit: 12,
      orderBy: desc(memes.created_at),
    }).catch(() => [])) || [];

    // 7. Public Templates Uploaded
    const publicTemplates = (await db.query.templates.findMany({
      where: and(eq(templates.uploaded_by, userId), eq(templates.moderation_status, "approved")),
      limit: 12,
      orderBy: desc(templates.created_at),
    }).catch(() => [])) || [];

    const currentStreak = streakRecord?.current_streak ?? 0;
    const longestStreak = streakRecord?.longest_streak ?? 0;
    const totalUpvotes = upvoteRes[0]?.count ?? 0;

    // Calculate Real XP
    let totalXp = 0;
    userBadgesList.forEach(() => { totalXp += 250; });
    totalXp += publicMemes.length * 50;
    totalXp += publicTemplates.length * 100;
    totalXp += currentStreak * 10;

    const levelInfo = calculateUserLevelInfo(totalXp);

    // 8. Public Activity Timeline
    const rawActivities = (await db.query.activities.findMany({
      where: eq(activities.user_id, userId),
      limit: 10,
      orderBy: desc(activities.created_at),
    }).catch(() => [])) || [];

    const activityTimeline = rawActivities.map((act: any) => ({
      id: act.id,
      type: act.action_type || "contribution",
      title: act.title || "User Activity",
      description: act.description || "",
      created_at: act.created_at,
    }));

    // 9. Aggregate all real contribution dates for the activity contribution grid
    const contributionDates = [
      { created_at: existingUser.created_at, type: "joined" },
      ...publicMemes.map((m: any) => ({ created_at: m.created_at, type: "meme" })),
      ...publicTemplates.map((t: any) => ({ created_at: t.created_at, type: "template" })),
      ...userBadgesList.map((ub: any) => ({ created_at: ub.unlocked_at || ub.created_at, type: "badge" })),
      ...rawActivities.map((a: any) => ({ created_at: a.created_at, type: "activity" })),
    ];

    return apiSuccess({
      available: false,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        username: existingUser.username,
        email: existingUser.email,
        image: existingUser.image,
        role: existingUser.role,
        bio: (existingUser as any).bio || "Virlio creator building branded memes and community templates.",
        website: (existingUser as any).website || null,
        country: (existingUser as any).country || "United States",
        language: (existingUser as any).language || "English",
        trust_score: existingUser.trust_score ?? 100,
        contributor_score: existingUser.contributor_score ?? publicTemplates.length * 50 + publicMemes.length * 10,
        account_status: existingUser.account_status,
        created_at: existingUser.created_at,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        total_upvotes: totalUpvotes,
        followers_count: followerCount,
        following_count: followingCount,
        total_xp: totalXp,
        level_info: levelInfo,
        badges: userBadgesList,
        brands_managed: publicBrands,
        featured_brand: featuredBrand,
        public_memes: publicMemes,
        public_templates: publicTemplates,
        activity_timeline: activityTimeline,
        contribution_stats: {
          templates_uploaded: publicTemplates.length,
          templates_approved: publicTemplates.length,
          templates_rejected: 0,
          memes_generated: publicMemes.length,
          public_memes_count: publicMemes.length,
          total_upvotes: totalUpvotes,
          bookmarks_count: 0,
        },
        contribution_dates: contributionDates,
      },
      reason: "Username is already taken.",
    });
  }

  return apiSuccess({ available: true, reason: "Username is available!" });
});
