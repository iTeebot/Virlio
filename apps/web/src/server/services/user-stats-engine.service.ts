import {
  userRepository,
  statsRepository,
  streakRepository,
  templateRepository,
  memeRepository,
  brandRepository,
  followRepository,
  badgeRepository,
  activityRepository,
  accountRepository,
  xpRepository,
} from "@/server/repositories";
import { db } from "@virlio/database";
import { users } from "@virlio/database/schema";
import { eq } from "drizzle-orm";
import { activityEngine } from "@/server/services/activity-engine.service";
import type { ContributionDay, ActivityTimelineEntry } from "@/server/services/activity-engine.service";

export interface ScoreItem {
  id: string;
  name: string;
  category: "identity" | "profile" | "verification";
  points: number;
  achieved: boolean;
  description: string;
}

export interface XPBreakdownItem {
  id: string;
  name: string;
  category: string;
  points: number;
  count: number;
  percentage: number;
  color: string;
}

export interface DynamicAchievement {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number; // 0 to 100
  reqCount: number;
  currentCount: number;
}

export interface UnifiedUserStatistics {
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    bio?: string;
    country?: string;
    website?: string;
    trustScore: number;
    contributorScore: number;
  };
  xp: number;
  level: number;
  nextLevelXp: number;
  levelProgress: number; // 0 to 100
  trustScore: number;
  trustBreakdown: ScoreItem[];
  connectedProviders: string[];
  currentStreak: number;
  longestStreak: number;
  followers: number;
  following: number;
  templates: {
    total: number;
    approved: number;
    pending: number;
    rejected: number;
    views: number;
    upvotes: number;
    downvotes: number;
    approvalRate: number;
    mostPopular: any;
  };
  memes: {
    total: number;
    public: number;
    private: number;
    upvotes: number;
    downvotes: number;
    mostPopular: any;
  };
  brands: {
    owned: number;
    verified: number;
    pending: number;
    items: any[];
  };
  xpBreakdown: XPBreakdownItem[];
  achievements: DynamicAchievement[];
  badges: any[];
  activities: any[];
  contributionCalendar: Record<string, ContributionDay>;
  activeDays: number;
  totalContributions: number;
  timeline: ActivityTimelineEntry[];
}

export class UserStatsEngine {
  /**
   * Calculate Level from XP
   */
  calculateLevel(xp: number): number {
    if (xp <= 0) return 1;
    if (xp < 50) return 1;
    if (xp < 150) return 2;
    if (xp < 300) return 3;
    if (xp < 600) return 4;
    if (xp < 1000) return 5;
    return Math.min(50, Math.floor(Math.sqrt(xp / 20)) + 1);
  }

  /**
   * Calculate Next Level XP Threshold
   */
  calculateNextLevelXp(level: number): number {
    if (level <= 1) return 50;
    if (level === 2) return 150;
    if (level === 3) return 300;
    if (level === 4) return 600;
    if (level === 5) return 1000;
    return Math.round(20 * Math.pow(level, 2));
  }

  /**
   * Universal Single Source of Truth for User Statistics
   */
  async getUserStatistics(userId: string): Promise<UnifiedUserStatistics> {
    // 1. Parallel database lookups
    const [
      dbUser,
      userAccounts,
      userStreaks,
      userTemplates,
      userMemes,
      userBrands,
      followerCount,
      followingCount,
      userBadgesList,
      activities,
    ] = await Promise.all([
      userRepository.findById(userId).catch(() => null),
      accountRepository.findByUserId(userId).catch(() => []),
      streakRepository.findByUser(userId).catch(() => []),
      templateRepository.findByContributor(userId, { limit: 500 }).catch(() => []),
      memeRepository.findByGenerator(userId, { limit: 500 }).catch(() => []),
      brandRepository.findByOwner(userId).catch(() => []),
      followRepository.getFollowerCount(userId).catch(() => 0),
      followRepository.getFollowingCount(userId).catch(() => 0),
      badgeRepository.findByUser(userId).catch(() => []),
      activityRepository.findByUser(userId, { limit: 10 }).catch(() => []),
    ]);

    const emailVerified = Boolean(dbUser?.emailVerified || (dbUser as any)?.email_verified);
    const connectedProviders = userAccounts.map((a) => a.provider.toLowerCase());

    // 2. Single Source of Truth for Trust Score & Breakdown
    const trustItems: ScoreItem[] = [
      {
        id: "email_verified",
        name: "Verified Email Address",
        category: "verification",
        points: 15,
        achieved: emailVerified,
        description: "Confirmed ownership of primary email",
      },
      {
        id: "github_connected",
        name: "GitHub Developer Identity",
        category: "identity",
        points: 20,
        achieved: connectedProviders.includes("github"),
        description: "Linked GitHub developer account",
      },
      {
        id: "linkedin_connected",
        name: "LinkedIn Professional Identity",
        category: "identity",
        points: 20,
        achieved: connectedProviders.includes("linkedin"),
        description: "Linked LinkedIn professional account",
      },
      {
        id: "google_connected",
        name: "Google Account Identity",
        category: "identity",
        points: 10,
        achieved: connectedProviders.includes("google"),
        description: "Linked Google user account",
      },
      {
        id: "facebook_connected",
        name: "Facebook Social Identity",
        category: "identity",
        points: 10,
        achieved: connectedProviders.includes("facebook"),
        description: "Linked Facebook social account",
      },
      {
        id: "username_set",
        name: "Custom Username Handle",
        category: "profile",
        points: 10,
        achieved: !!dbUser?.username && dbUser.username.length >= 3,
        description: "Configured unique @username handle",
      },
      {
        id: "avatar_configured",
        name: "Profile Photo / Avatar",
        category: "profile",
        points: 10,
        achieved: !!(dbUser?.image || dbUser?.avatar_url),
        description: "Uploaded profile avatar picture",
      },
      {
        id: "bio_configured",
        name: "Creator Bio",
        category: "profile",
        points: 5,
        achieved: !!(dbUser?.bio && dbUser.bio.trim().length > 0),
        description: "Added profile bio description",
      },
    ];

    const rawTrustScore = trustItems.filter((i) => i.achieved).reduce((sum, item) => sum + item.points, 0);
    const trustScore = Math.min(100, rawTrustScore);

    // 3. Streaks from ActivityEngine (single source of truth)
    const activityStats = await activityEngine.getUserActivityStats(userId).catch(() => ({
      currentStreak: 0, longestStreak: 0, activeDays: 0, totalContributions: 0,
      contributionCalendar: {} as Record<string, ContributionDay>, timeline: [] as ActivityTimelineEntry[],
    }));
    const currentStreak = activityStats.currentStreak;
    const longestStreak = activityStats.longestStreak;

    // Templates
    const totalTemplates = userTemplates.length;
    const approvedTemplates = userTemplates.filter((t: any) => t.status === "approved").length;
    const pendingTemplates = userTemplates.filter((t: any) => t.status === "pending").length;
    const rejectedTemplates = userTemplates.filter((t: any) => t.status === "rejected").length;
    const templateViews = userTemplates.reduce((acc: number, t: any) => acc + (t.views_count || 0), 0);
    const templateUpvotes = userTemplates.reduce((acc: number, t: any) => acc + (t.upvotes_count || 0), 0);
    const templateDownvotes = userTemplates.reduce((acc: number, t: any) => acc + (t.downvotes_count || 0), 0);
    const templateApprovalRate = totalTemplates > 0 ? Math.round((approvedTemplates / totalTemplates) * 100) : 0;
    const mostPopularTemplate = userTemplates.length > 0 ? [...userTemplates].sort((a: any, b: any) => (b.upvotes_count || 0) - (a.upvotes_count || 0))[0] : null;

    // Memes
    const totalMemes = userMemes.length;
    const publicMemes = userMemes.filter((m: any) => m.visibility === "public" || !m.is_private).length;
    const privateMemes = userMemes.filter((m: any) => m.visibility === "private" || m.is_private).length;
    const memeUpvotes = userMemes.reduce((acc: number, m: any) => acc + ((m as any).likes_count || (m as any).upvotes_count || 0), 0);
    const memeDownvotes = userMemes.reduce((acc: number, m: any) => acc + ((m as any).dislikes_count || (m as any).downvotes_count || 0), 0);
    const mostPopularMeme = userMemes.length > 0 ? [...userMemes].sort((a: any, b: any) => (((b as any).likes_count || (b as any).upvotes_count || 0) - ((a as any).likes_count || (a as any).upvotes_count || 0)))[0] : null;

    // Brands
    const brandsOwned = userBrands.length;
    const verifiedBrands = userBrands.filter((b: any) => (b.verification_status || "").toLowerCase() === "verified").length;
    const pendingBrands = userBrands.filter((b: any) => (b.verification_status || "").toLowerCase() !== "verified").length;

    // 4. XP Engine Official Rules
    const brandCreatedXP = brandsOwned * 10;
    const verifiedBrandXP = verifiedBrands * 25;
    const templateUploadedXP = totalTemplates * 1;
    const templateApprovedXP = approvedTemplates * 1;
    const templateVotesXP = Math.max(0, templateUpvotes - templateDownvotes);
    const memeGeneratedXP = totalMemes * 1;
    const memeVotesXP = Math.max(0, memeUpvotes - memeDownvotes);
    const streakXP = Math.round((currentStreak * (currentStreak + 1)) / 2);
    const followingXP = followingCount > 0 ? 1 : 0;
    const followerXP = followerCount * 2;

    const rawTotalXP =
      brandCreatedXP +
      verifiedBrandXP +
      templateUploadedXP +
      templateApprovedXP +
      templateVotesXP +
      memeGeneratedXP +
      memeVotesXP +
      streakXP +
      followingXP +
      followerXP;

    const xp = Math.max(0, rawTotalXP);
    const level = this.calculateLevel(xp);
    const nextLevelXp = this.calculateNextLevelXp(level);
    const levelProgress = Math.min(100, Math.round((xp / nextLevelXp) * 100));

    // 5. XP Breakdown
    const rawBreakdown = [
      { id: "brand-created", name: "Brand Workspace Created", category: "Brands", points: brandCreatedXP, count: brandsOwned, color: "bg-blue-600" },
      { id: "verified-brand", name: "Verified Brand Badge", category: "Brands", points: verifiedBrandXP, count: verifiedBrands, color: "bg-emerald-600" },
      { id: "template-upload", name: "Templates Uploaded & Approved", category: "Templates", points: templateUploadedXP + templateApprovedXP, count: totalTemplates, color: "bg-purple-600" },
      { id: "template-upvotes", name: "Template Community Upvotes", category: "Templates", points: templateVotesXP, count: templateUpvotes, color: "bg-purple-500" },
      { id: "meme-generated", name: "Memes Generated", category: "Memes", points: memeGeneratedXP, count: totalMemes, color: "bg-amber-500" },
      { id: "meme-upvotes", name: "Meme Community Upvotes", category: "Memes", points: memeVotesXP, count: memeUpvotes, color: "bg-amber-600" },
      { id: "streak-xp", name: "Daily Streak Rewards", category: "Streaks", points: streakXP, count: currentStreak, color: "bg-indigo-600" },
      { id: "community-followers", name: "Community Followers Gained", category: "Community", points: followerXP + followingXP, count: followerCount, color: "bg-blue-500" },
    ];

    const activeBreakdown = rawBreakdown.filter((b) => b.points > 0);
    const totalActivePoints = activeBreakdown.reduce((sum, item) => sum + item.points, 0);

    const xpBreakdown: XPBreakdownItem[] = (activeBreakdown.length > 0 ? activeBreakdown : rawBreakdown.slice(0, 4)).map((item) => {
      const pct = totalActivePoints > 0 ? Math.round((item.points / totalActivePoints) * 100) : 0;
      return {
        ...item,
        percentage: pct,
      };
    });

    // 6. Dynamic Achievement Evaluation
    const achievementDefinitions = [
      {
        id: "verified-brand",
        name: "Verified Brand",
        slug: "verified-brand",
        description: "Verify at least 1 official brand domain or social account.",
        icon: "ShieldCheck",
        reqCount: 1,
        currentCount: verifiedBrands,
      },
      {
        id: "template-creator",
        name: "Template Creator",
        slug: "template-creator",
        description: "Upload and publish at least 1 approved template.",
        icon: "Layers",
        reqCount: 1,
        currentCount: approvedTemplates,
      },
      {
        id: "meme-creator",
        name: "Meme Studio Creator",
        slug: "meme-creator",
        description: "Render at least 1 meme using Virlio AI Studio.",
        icon: "Sparkles",
        reqCount: 1,
        currentCount: totalMemes,
      },
      {
        id: "community-member",
        name: "Community Leader",
        slug: "community-member",
        description: "Gain at least 1 follower on your Virlio profile.",
        icon: "Users",
        reqCount: 1,
        currentCount: followerCount,
      },
      {
        id: "streak-master",
        name: "Streak Master",
        slug: "streak-master",
        description: "Maintain an active daily streak of 3 days or more.",
        icon: "Flame",
        reqCount: 3,
        currentCount: currentStreak,
      },
      {
        id: "top-contributor",
        name: "Top Contributor",
        slug: "top-contributor",
        description: "Reach 100+ Total XP on Virlio.",
        icon: "Award",
        reqCount: 100,
        currentCount: xp,
      },
    ];

    const unlockedBadgeSlugs = new Set((userBadgesList || []).map((ub: any) => ub.badge?.slug || ub.badge_id));
    const achievements: DynamicAchievement[] = [];

    for (const def of achievementDefinitions) {
      const isUnlocked = def.currentCount >= def.reqCount;
      const progress = Math.min(100, Math.round((def.currentCount / def.reqCount) * 100));

      achievements.push({
        id: def.id,
        name: def.name,
        slug: def.slug,
        description: def.description,
        icon: def.icon,
        unlocked: isUnlocked,
        progress,
        reqCount: def.reqCount,
        currentCount: def.currentCount,
      });

      if (isUnlocked && !unlockedBadgeSlugs.has(def.slug)) {
        await badgeRepository.awardBadgeBySlug(userId, def.slug).catch(() => null);
      }
    }

    // 7. Synchronize Single Source of Truth to DB tables
    await Promise.all([
      userRepository.update(userId, {
        contributor_score: xp,
        trust_score: trustScore,
      } as any).catch(() => null),

      statsRepository.upsertUserStats(userId, {
        current_xp: xp,
        current_level: level,
        memes_generated: totalMemes,
        likes_received: templateUpvotes + memeUpvotes,
        current_streak: currentStreak,
      }).catch(() => null),

      xpRepository.updateLevel(userId, level, xp, xp, nextLevelXp).catch(() => null),
    ]);

    return {
      userId,
      user: {
        id: userId,
        name: dbUser?.name || "Virlio Creator",
        username: dbUser?.username || "creator",
        email: dbUser?.email || "",
        emailVerified,
        image: dbUser?.image || dbUser?.avatar_url || "",
        bio: dbUser?.bio || "",
        country: dbUser?.country || "",
        website: dbUser?.website || "",
        trustScore,
        contributorScore: xp,
      },
      xp,
      level,
      nextLevelXp,
      levelProgress,
      trustScore,
      trustBreakdown: trustItems,
      connectedProviders,
      currentStreak,
      longestStreak,
      followers: followerCount,
      following: followingCount,
      templates: {
        total: totalTemplates,
        approved: approvedTemplates,
        pending: pendingTemplates,
        rejected: rejectedTemplates,
        views: templateViews,
        upvotes: templateUpvotes,
        downvotes: templateDownvotes,
        approvalRate: templateApprovalRate,
        mostPopular: mostPopularTemplate,
      },
      memes: {
        total: totalMemes,
        public: publicMemes,
        private: privateMemes,
        upvotes: memeUpvotes,
        downvotes: memeDownvotes,
        mostPopular: mostPopularMeme,
      },
      brands: {
        owned: brandsOwned,
        verified: verifiedBrands,
        pending: pendingBrands,
        items: userBrands,
      },
      xpBreakdown,
      achievements,
      badges: userBadgesList || [],
      activities: activityStats.timeline || [],
      contributionCalendar: activityStats.contributionCalendar,
      activeDays: activityStats.activeDays,
      totalContributions: activityStats.totalContributions,
      timeline: activityStats.timeline,
    };
  }

  /**
   * Batch recalculate all users
   */
  async batchRecalculateAllUsers(): Promise<{ totalUsers: number; repaired: number }> {
    const allUsers = await db.query.users.findMany();
    let repaired = 0;

    for (const u of allUsers) {
      if (u.id) {
        await this.getUserStatistics(u.id);
        repaired++;
      }
    }

    return { totalUsers: allUsers.length, repaired };
  }
}

export const userStatsEngine = new UserStatsEngine();
