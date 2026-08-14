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
 * Cached User Profile Data (Delegates to canonical userService.getPublicUserProfile)
 */
export const getCachedUserProfile = (username: string) =>
  unstable_cache(
    async () => {
      const { userService } = await import("@/server/services");
      return userService.getPublicUserProfile(username);
    },
    [`user-profile-${username}`],
    {
      revalidate: CACHE_LIFETIMES.PROFILE,
      tags: [CACHE_TAGS.PROFILE(username)],
    }
  )();

/**
 * Cached Brand Profile Data (Delegates to canonical brandService.getBrandProfile)
 */
export const getCachedBrandProfile = (slug: string) =>
  unstable_cache(
    async () => {
      const { brandService } = await import("@/server/services");
      return brandService.getBrandProfile(slug);
    },
    [`brand-profile-${slug}`],
    {
      revalidate: CACHE_LIFETIMES.BRAND,
      tags: [CACHE_TAGS.BRAND(slug)],
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
