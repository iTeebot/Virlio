import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { userRepository, badgeRepository } from "@/server/repositories";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";
import { earlyAccessBadgeService } from "@/server/services/early-access-badge.service";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export interface BadgeProgressItem {
  currentCount: number;
  reqCount: number;
  percentage: number;
  formattedProgress: string;
}

export async function GET(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();

    if (!session?.user?.id) {
      return apiSuccess({
        authenticated: false,
        unlockedBadges: [],
        badgeProgress: {},
        totalXp: 0,
        levelInfo: { level: 1, title: "Novice Creator", minXp: 0, maxXp: 250 },
      });
    }

    const userId = session.user.id;
    const dbUser = await userRepository.findById(userId);

    if (dbUser?.created_at) {
      // Evaluate Early Access badge based strictly on server creation date vs Sept 30, 2026 cutoff
      await earlyAccessBadgeService.evaluateAndAward(userId, dbUser.created_at).catch(() => null);
    }

    // Use single source of truth UserStatsEngine statistics
    const stats = await userStatsEngine.getUserStatistics(userId);
    const rawUserBadges = (await badgeRepository.findByUser(userId)) || [];

    const unlockedSlugs: string[] = [];
    rawUserBadges.forEach((ub: any) => {
      const slug = ub.badge?.slug || ub.badge_id;
      if (slug) unlockedSlugs.push(slug);
    });

    // Also include dynamic unlocked achievements
    stats.achievements.forEach((a) => {
      if (a.unlocked) unlockedSlugs.push(a.slug);
    });

    const uniqueUnlockedSlugs = Array.from(new Set(unlockedSlugs));

    // Calculate Tamper-Proof Server-Side Progress Indicators for All 13 Badges
    const approvedTemplates = stats.templates.approved;
    const totalMemes = stats.memes.total;
    const totalUpvotes = stats.templates.upvotes + stats.memes.upvotes;
    const verifiedBrands = stats.brands.verified;
    const isEarlyAdopterQualified = dbUser?.created_at ? earlyAccessBadgeService.isEligible(dbUser.created_at) : false;

    const buildProgress = (current: number, req: number, formatText: string): BadgeProgressItem => {
      const currentClamped = Math.max(0, current);
      const pct = Math.min(100, Math.round((currentClamped / Math.max(1, req)) * 100));
      return {
        currentCount: currentClamped,
        reqCount: req,
        percentage: pct,
        formattedProgress: formatText,
      };
    };

    const badgeProgress: Record<string, BadgeProgressItem> = {
      "early-adopter": buildProgress(
        isEarlyAdopterQualified ? 1 : 0,
        1,
        isEarlyAdopterQualified ? "Qualified (Early Access Account)" : "Account Created After Cutoff"
      ),
      "top-contributor": buildProgress(stats.xp, 1000, `${stats.xp.toLocaleString()} / 1,000 XP`),
      "verified-brand": buildProgress(verifiedBrands, 1, `${verifiedBrands} / 1 Verified Brand`),
      "100-templates": buildProgress(approvedTemplates, 100, `${approvedTemplates} / 100 Templates`),
      "500-templates": buildProgress(approvedTemplates, 500, `${approvedTemplates} / 500 Templates`),
      "1000-templates": buildProgress(approvedTemplates, 1000, `${approvedTemplates.toLocaleString()} / 1,000 Templates`),
      "100-memes": buildProgress(totalMemes, 100, `${totalMemes} / 100 Memes`),
      "1000-memes": buildProgress(totalMemes, 1000, `${totalMemes.toLocaleString()} / 1,000 Memes`),
      "10k-memes": buildProgress(totalMemes, 10000, `${totalMemes.toLocaleString()} / 10,000 Memes`),
      "community-favorite": buildProgress(totalUpvotes, 10000, `${totalUpvotes.toLocaleString()} / 10,000 Upvotes`),
      "ai-approved": buildProgress(approvedTemplates, 50, `${approvedTemplates} / 50 Submissions`),
      "trend-setter": buildProgress(approvedTemplates > 0 ? 1 : 0, 1, approvedTemplates > 0 ? "1 / 1 Trending Hit" : "0 / 1 Trending Hit"),
      "hall-of-fame": buildProgress(stats.templates.views, 1000000, `${stats.templates.views.toLocaleString()} / 1,000,000 Views`),
    };

    return apiSuccess({
      authenticated: true,
      unlockedBadges: uniqueUnlockedSlugs,
      badgeProgress,
      totalXp: stats.xp,
      levelInfo: {
        level: stats.level,
        title: `Lvl ${stats.level} Creator`,
        minXp: 0,
        maxXp: stats.nextLevelXp,
      },
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch achievements", 500);
  }
}
