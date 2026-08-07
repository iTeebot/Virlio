import { unstable_cache, revalidateTag } from "next/cache";
import { memeRepository, userRepository, brandRepository, templateRepository, followRepository, badgeRepository } from "@/server/repositories";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";

/**
 * Server Cache Tag Constants
 */
export const CACHE_TAGS = {
  EXPLORE: "explore",
  TEMPLATES: "templates",
  LEADERBOARD: "leaderboard",
  PROFILE: (username: string) => `profile:${username}`,
  BRAND: (slug: string) => `brand:${slug}`,
};

/**
 * Cache Lifetimes (in seconds)
 */
export const CACHE_LIFETIMES = {
  EXPLORE: 120, // 2 minutes
  PROFILE: 300, // 5 minutes
  TEMPLATES: 600, // 10 minutes
  LEADERBOARD: 300, // 5 minutes
  BRAND: 300, // 5 minutes
};

/**
 * Cached Public Memes for Explore Feed
 */
export const getCachedPublicMemes = (limit: number = 10, offset: number = 0) =>
  unstable_cache(
    async () => memeRepository.findPublicMemes({ limit, offset }),
    [`explore-memes-${limit}-${offset}`],
    {
      revalidate: CACHE_LIFETIMES.EXPLORE,
      tags: [CACHE_TAGS.EXPLORE],
    }
  )();

/**
 * Cached User Profile Data
 */
export const getCachedUserProfile = (username: string) =>
  unstable_cache(
    async () => {
      const dbUser = await userRepository.findByUsername(username);
      if (!dbUser) return null;

      const [stats, userBrands, userMemes, userTemplates, userBadges, followerCount, followingCount] = await Promise.all([
        userStatsEngine.getUserStatistics(dbUser.id),
        brandRepository.findByOwner(dbUser.id).catch(() => []),
        memeRepository.findByGenerator(dbUser.id, { limit: 50 }).catch(() => []),
        templateRepository.findByContributor(dbUser.id, { limit: 50 }).catch(() => []),
        badgeRepository.findByUser(dbUser.id).catch(() => []),
        followRepository.getFollowerCount(dbUser.id).catch(() => 0),
        followRepository.getFollowingCount(dbUser.id).catch(() => 0),
      ]);

      return {
        dbUser,
        stats,
        userBrands,
        userMemes,
        userTemplates,
        userBadges,
        followerCount,
        followingCount,
      };
    },
    [`user-profile-${username}`],
    {
      revalidate: CACHE_LIFETIMES.PROFILE,
      tags: [CACHE_TAGS.PROFILE(username)],
    }
  )();

/**
 * Cache Invalidation Helper
 */
export function invalidateCacheTag(tag: string) {
  try {
    (revalidateTag as any)(tag);
  } catch {
    // Silent handle if invoked outside Next.js request context
  }
}
