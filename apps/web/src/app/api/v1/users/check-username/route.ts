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

    // 3. Streaks Record
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

    // 8. Raw Activities
    const rawActivities = (await db.query.activities.findMany({
      where: eq(activities.user_id, userId),
      limit: 20,
      orderBy: desc(activities.created_at),
    }).catch(() => [])) || [];

    // 9. Collect and map all real contribution items for Timeline & Streaks
    const rawContributionItems = [
      ...publicMemes.map((m: any) => ({
        created_at: m.created_at,
        type: "meme",
        title: `Generated Meme "${m.title || "Untitled Meme"}"`,
        description: "Created new viral meme format",
      })),
      ...publicTemplates.map((t: any) => ({
        created_at: t.created_at,
        type: "template",
        title: `Uploaded Template "${t.title || "Meme Template"}"`,
        description: `Submitted template in category "${t.category || "General"}"`,
      })),
      ...userBadgesList.map((ub: any) => ({
        created_at: ub.unlocked_at || ub.created_at,
        type: "badge",
        title: `Unlocked Badge "${ub.badge?.name || "Achievement"}"`,
        description: ub.badge?.description || "Earned community badge",
      })),
      ...rawActivities.map((a: any) => {
        let title = a.metadata?.title ? `Activity: ${a.metadata.title}` : "User Activity";
        let desc = a.metadata?.category ? `Category: ${a.metadata.category}` : "Interacted with Virlio community";
        if (a.activity_type === "template_approved" || a.activity_type === "template_uploaded") {
          title = `Uploaded Template "${a.metadata?.title || "Meme Template"}"`;
          desc = `Submitted format in ${a.metadata?.category || "Community"}`;
        } else if (a.activity_type === "meme_generated") {
          title = "Generated Branded Meme";
          desc = "Created new viral meme format";
        }
        return {
          created_at: a.created_at,
          type: "activity",
          title,
          description: desc,
        };
      }),
      {
        created_at: existingUser.created_at,
        type: "joined",
        title: "Joined Virlio Community",
        description: "Created creator profile account",
      },
    ];

    // Sort timeline chronologically descending
    const sortedTimeline = rawContributionItems
      .filter((item) => item.created_at && !isNaN(new Date(item.created_at).getTime()))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    const activityTimeline = sortedTimeline.slice(0, 15).map((item, idx) => ({
      id: `act-${idx}-${new Date(item.created_at).getTime()}`,
      type: item.type,
      title: item.title,
      description: item.description,
      created_at: item.created_at,
    }));

    // Calculate real dynamic consecutive streak from contribution dates
    const uniqueDaysSet = new Set<string>();
    sortedTimeline.forEach((item) => {
      const d = new Date(item.created_at);
      const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      uniqueDaysSet.add(dayKey);
    });

    const sortedDayKeys = Array.from(uniqueDaysSet).sort((a, b) => (a < b ? 1 : -1)); // Descending YYYY-MM-DD

    let calculatedCurrentStreak = 0;
    let calculatedLongestStreak = 0;

    if (sortedDayKeys.length > 0) {
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

      const hasRecentActivity = sortedDayKeys.includes(todayKey) || sortedDayKeys.includes(yesterdayKey);

      let tempStreak = 0;
      let prevDate: Date | null = null;

      for (let i = 0; i < sortedDayKeys.length; i++) {
        const currDate = new Date(sortedDayKeys[i]);
        if (!prevDate) {
          tempStreak = 1;
        } else {
          const diffMs = prevDate.getTime() - currDate.getTime();
          const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays === 1) {
            tempStreak += 1;
          } else {
            if (tempStreak > calculatedLongestStreak) {
              calculatedLongestStreak = tempStreak;
            }
            tempStreak = 1;
          }
        }
        prevDate = currDate;
      }
      if (tempStreak > calculatedLongestStreak) {
        calculatedLongestStreak = tempStreak;
      }

      if (hasRecentActivity) {
        const startKey = sortedDayKeys.includes(todayKey) ? todayKey : yesterdayKey;
        let curr = new Date(startKey);
        while (true) {
          const k = `${curr.getFullYear()}-${String(curr.getMonth() + 1).padStart(2, "0")}-${String(curr.getDate()).padStart(2, "0")}`;
          if (uniqueDaysSet.has(k)) {
            calculatedCurrentStreak++;
            curr.setDate(curr.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    const dbCurrentStreak = streakRecord?.current_streak ?? 0;
    const dbLongestStreak = streakRecord?.longest_streak ?? 0;

    const currentStreak = Math.max(dbCurrentStreak, calculatedCurrentStreak);
    const longestStreak = Math.max(dbLongestStreak, calculatedLongestStreak, currentStreak);
    const totalUpvotes = upvoteRes[0]?.count ?? 0;

    // Calculate Real XP
    let totalXp = 0;
    userBadgesList.forEach(() => { totalXp += 250; });
    totalXp += publicMemes.length * 50;
    totalXp += publicTemplates.length * 100;
    totalXp += currentStreak * 10;

    const levelInfo = calculateUserLevelInfo(totalXp);

    const contributionDates = sortedTimeline.map((item) => ({
      created_at: item.created_at,
      type: item.type,
    }));

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
