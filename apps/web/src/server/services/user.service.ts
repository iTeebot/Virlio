import {
  userRepository,
  brandRepository,
  memeRepository,
  templateRepository,
  badgeRepository,
  followRepository,
  accountRepository,
} from "../repositories";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";
import { activityEngine } from "@/server/services/activity-engine.service";
import type { User } from "@virlio/database/types";

export async function getProfile(userId: string) {
  return userRepository.findById(userId);
}

export async function getPublicProfile(username: string) {
  return userRepository.findByUsername(username);
}

/**
 * Canonical Single Source of Truth for Public User Profiles
 * Used by /profiles/[username], /contributors/[username], and public API endpoints.
 */
export async function getPublicUserProfile(usernameOrId: string) {
  let dbUser: any = null;
  if (usernameOrId.includes("-") && usernameOrId.length > 20) {
    dbUser = await userRepository.findById(usernameOrId);
  } else {
    dbUser = await userRepository.findByUsername(usernameOrId);
  }

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
}

/**
 * Canonical Single Source of Truth for Current Authenticated User Data
 * Used by /dashboard/overview, /dashboard/settings, and /api/v1/users/settings/all.
 */
export async function getCurrentUserProfile(userId: string) {
  const [dbUser, stats, userAccounts, userBrands, userMemes, rawActivities] = await Promise.all([
    userRepository.findById(userId).catch(() => null),
    userStatsEngine.getUserStatistics(userId).catch(() => null),
    accountRepository.findByUserId(userId).catch(() => []),
    brandRepository.findUserAccessibleBrands(userId).catch(() => []),
    memeRepository.findByGenerator(userId, { limit: 6 }).catch(() => []),
    activityEngine.getActivityTimeline(userId, 5).catch(() => []),
  ]);

  if (!dbUser) return null;

  const userActivities = rawActivities.map((a) => ({
    id: a.id,
    activity_type: a.type as any,
    created_at: a.created_at,
    metadata: a.metadata,
    action: a.label,
    details: { message: a.label },
  }));

  const user = {
    id: dbUser.id,
    name: dbUser.name || "",
    username: dbUser.username || "",
    email: dbUser.email || "",
    bio: dbUser.bio || "",
    country: dbUser.country || "",
    website: dbUser.website || "",
    image: dbUser.image || dbUser.avatar_url || "",
    avatar_url: dbUser.avatar_url || dbUser.image || "",
    emailVerified: Boolean(dbUser.emailVerified || (dbUser as any).email_verified),
    role: dbUser.role || "user",
    account_status: dbUser.account_status || "active",
    trust_score: stats?.trustScore ?? dbUser.trust_score ?? 100,
    contributor_score: stats?.xp ?? dbUser.contributor_score ?? 0,
  };

  const sanitizedAccounts = (userAccounts || []).map((acc) => ({
    provider: acc.provider,
    providerAccountId: acc.providerAccountId,
    type: acc.type,
  }));

  const profileScore = {
    score: stats?.trustScore ?? 100,
    maxScore: 100,
    percentage: stats?.trustScore ?? 100,
    breakdown: stats?.trustBreakdown ?? [],
    connectedProviders: stats?.connectedProviders ?? [],
  };

  return {
    user,
    stats,
    accounts: sanitizedAccounts,
    profileScore,
    userBrands,
    userMemes,
    userActivities,
  };
}

export async function updateProfile(userId: string, data: Partial<User>) {
  return userRepository.update(userId, data);
}

export async function checkUsernameAvailability(username: string) {
  const user = await userRepository.findByUsername(username);
  return !user;
}

export async function deactivateAccount(userId: string) {
  return userRepository.softDelete(userId);
}
