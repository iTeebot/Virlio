import { NextRequest } from "next/server";
import { db } from "@virlio/database";
import { memes, templates, activities } from "@virlio/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { userRepository } from "@/server/repositories";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

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

    // Single source of truth statistics from UserStatsEngine
    const stats = await userStatsEngine.getUserStatistics(userId);

    // Public Memes Generated
    const publicMemes = (await db.query.memes.findMany({
      where: and(eq(memes.generator_id, userId), eq(memes.visibility, "public")),
      limit: 12,
      orderBy: desc(memes.created_at),
    }).catch(() => [])) || [];

    // Public Templates Uploaded
    const publicTemplates = (await db.query.templates.findMany({
      where: and(eq(templates.uploaded_by, userId), eq(templates.moderation_status, "approved")),
      limit: 12,
      orderBy: desc(templates.created_at),
    }).catch(() => [])) || [];

    // Raw Activities
    const rawActivities = (await db.query.activities.findMany({
      where: eq(activities.user_id, userId),
      limit: 20,
      orderBy: desc(activities.created_at),
    }).catch(() => [])) || [];

    const featuredBrand = stats.brands.items.find((b) => (b.verification_status || "").toLowerCase() === "verified") || stats.brands.items[0] || null;

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
        trust_score: stats.trustScore,
        contributor_score: stats.xp,
        account_status: existingUser.account_status,
        created_at: existingUser.created_at,
        current_streak: stats.currentStreak,
        longest_streak: stats.longestStreak,
        total_upvotes: stats.templates.upvotes + stats.memes.upvotes,
        followers_count: stats.followers,
        following_count: stats.following,
        total_xp: stats.xp,
        level_info: {
          level: stats.level,
          title: `Lvl ${stats.level} Creator`,
          minXp: 0,
          maxXp: stats.nextLevelXp,
        },
        badges: stats.achievements.filter((a) => a.unlocked),
        achievements: stats.achievements,
        brands_managed: stats.brands.items,
        featured_brand: featuredBrand,
        public_memes: publicMemes,
        public_templates: publicTemplates,
        activity_timeline: stats.timeline,
        contribution_calendar: stats.contributionCalendar,
        active_days: stats.activeDays,
        total_contributions: stats.totalContributions,
        contribution_stats: {
          templates_uploaded: stats.templates.total,
          templates_approved: stats.templates.approved,
          templates_rejected: stats.templates.rejected,
          memes_generated: stats.memes.total,
          public_memes_count: stats.memes.public,
          total_upvotes: stats.templates.upvotes + stats.memes.upvotes,
          bookmarks_count: 0,
        },
      },
      reason: "Username is already taken.",
    });
  }

  return apiSuccess({ available: true, reason: "Username is available!" });
});
