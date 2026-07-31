import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { badgeRepository } from "@/server/repositories";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const BADGE_REWARDS: Record<string, { xp: number }> = {
  "early-adopter": { xp: 250 },
  "top-contributor": { xp: 1000 },
  "verified-brand": { xp: 500 },
  "100-templates": { xp: 500 },
  "500-templates": { xp: 1500 },
  "1000-templates": { xp: 3000 },
  "100-memes": { xp: 300 },
  "1000-memes": { xp: 1200 },
  "10k-memes": { xp: 5000 },
  "community-favorite": { xp: 1000 },
  "ai-approved": { xp: 400 },
  "trend-setter": { xp: 1500 },
  "hall-of-fame": { xp: 10000 },
};

function calculateLevel(totalXp: number) {
  if (totalXp >= 10000) return { level: 6, title: "Hall of Fame Legend", minXp: 10000, maxXp: 20000 };
  if (totalXp >= 5000) return { level: 5, title: "Elite Creator", minXp: 5000, maxXp: 10000 };
  if (totalXp >= 2500) return { level: 4, title: "Master Creator", minXp: 2500, maxXp: 5000 };
  if (totalXp >= 1000) return { level: 3, title: "Pro Creator", minXp: 1000, maxXp: 2500 };
  if (totalXp >= 500) return { level: 2, title: "Rising Creator", minXp: 500, maxXp: 1000 };
  return { level: 1, title: "Novice Creator", minXp: 0, maxXp: 500 };
}

export async function GET(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();

    if (!session?.user?.id) {
      return apiSuccess({
        authenticated: false,
        unlockedBadges: [],
        totalXp: 0,
        levelInfo: calculateLevel(0),
      });
    }

    const userId = session.user.id;

    // Ensure early-adopter badge exists & is awarded if user is active
    try {
      await badgeRepository.awardBadgeBySlug(userId, "early-adopter");
    } catch (e) {
      // Ignore if database seed not yet run
    }

    const rawUserBadges = (await badgeRepository.findByUser(userId)) || [];
    
    // Collect unlocked badge slugs ONLY (1 slug per badge record)
    const unlockedSlugs: string[] = [];
    rawUserBadges.forEach((ub: any) => {
      const slug = ub.badge?.slug || (typeof ub.badge_id === "string" && !ub.badge_id.startsWith("badge-") ? ub.badge_id : null);
      if (slug) unlockedSlugs.push(slug);
    });

    // If user has raw badges but slug join was null, fallback to early-adopter
    if (unlockedSlugs.length === 0 && rawUserBadges.length > 0) {
      unlockedSlugs.push("early-adopter");
    }

    // Deduplicate
    const uniqueUnlockedSlugs = Array.from(new Set(unlockedSlugs));

    // Calculate XP strictly from unique unlocked badges
    let totalXp = 0;
    uniqueUnlockedSlugs.forEach((slug) => {
      totalXp += BADGE_REWARDS[slug]?.xp || 250;
    });

    const levelInfo = calculateLevel(totalXp);

    return apiSuccess({
      authenticated: true,
      unlockedBadges: uniqueUnlockedSlugs,
      totalXp,
      levelInfo,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch achievements", 500);
  }
}
