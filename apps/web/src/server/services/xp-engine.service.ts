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
  xpRepository,
} from "@/server/repositories";
import { activityEngine } from "@/server/services/activity-engine.service";
import { db } from "@virlio/database";
import { users, userStats, userBadges, votes } from "@virlio/database/schema";
import { eq, and, sql } from "drizzle-orm";

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

export interface UserAnalyticsResult {
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
    emailVerified: boolean;
  };
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  trustScore: number;
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
  community: {
    followers: number;
    following: number;
  };
  xpBreakdown: XPBreakdownItem[];
  achievements: DynamicAchievement[];
  activities: any[];
}

export class XPAnalyticsEngine {
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
   * Calculate Trust Score dynamically
   */
  calculateTrustScore(data: {
    emailVerified: boolean;
    connectedProvidersCount: number;
    verifiedBrandsCount: number;
    approvedTemplatesCount: number;
  }): number {
    let score = 50; // Base score
    if (data.emailVerified) score += 20;
    score += Math.min(30, data.connectedProvidersCount * 10);
    score += data.verifiedBrandsCount * 15;
    score += Math.min(20, data.approvedTemplatesCount * 5);
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Recalculate full user analytics from DB single source of truth
   */
  async recalculateUserAnalytics(userId: string): Promise<UserAnalyticsResult> {
    // 1. Fetch raw data from database in parallel
    const [
      dbUser,
      userStreaks,
      userTemplates,
      userMemes,
      userBrands,
      followerCount,
      followingCount,
      userBadgesList,
      activities,
      accounts,
    ] = await Promise.all([
      userRepository.findById(userId).catch(() => null),
      streakRepository.findByUser(userId).catch(() => []),
      templateRepository.findByContributor(userId, { limit: 500 }).catch(() => []),
      memeRepository.findByGenerator(userId, { limit: 500 }).catch(() => []),
      brandRepository.findByOwner(userId).catch(() => []),
      followRepository.getFollowerCount(userId).catch(() => 0),
      followRepository.getFollowingCount(userId).catch(() => 0),
      badgeRepository.findByUser(userId).catch(() => []),
      activityRepository.findByUser(userId, { limit: 10 }).catch(() => []),
      db.query.accounts?.findMany({ where: eq((users as any).id, userId) }).catch(() => []),
    ]);

    // Streaks from ActivityEngine (single source of truth)
    const streakData = await activityEngine.calculateStreaksFromEvents(userId).catch(() => ({ currentStreak: 0, longestStreak: 0 }));
    const currentStreak = streakData.currentStreak;
    const longestStreak = streakData.longestStreak;

    // Template Stats
    const totalTemplates = userTemplates.length;
    const approvedTemplates = userTemplates.filter((t: any) => t.status === "approved").length;
    const pendingTemplates = userTemplates.filter((t: any) => t.status === "pending").length;
    const rejectedTemplates = userTemplates.filter((t: any) => t.status === "rejected").length;
    const templateViews = userTemplates.reduce((acc: number, t: any) => acc + (t.views_count || 0), 0);
    const templateUpvotes = userTemplates.reduce((acc: number, t: any) => acc + (t.upvotes_count || 0), 0);
    const templateDownvotes = userTemplates.reduce((acc: number, t: any) => acc + (t.downvotes_count || 0), 0);
    const templateApprovalRate = totalTemplates > 0 ? Math.round((approvedTemplates / totalTemplates) * 100) : 0;
    const mostPopularTemplate = userTemplates.length > 0 ? [...userTemplates].sort((a: any, b: any) => (b.upvotes_count || 0) - (a.upvotes_count || 0))[0] : null;

    // Meme Stats
    const totalMemes = userMemes.length;
    const publicMemes = userMemes.filter((m: any) => m.visibility === "public" || !m.is_private).length;
    const privateMemes = userMemes.filter((m: any) => m.visibility === "private" || m.is_private).length;
    const memeUpvotes = userMemes.reduce((acc: number, m: any) => acc + ((m as any).likes_count || (m as any).upvotes_count || 0), 0);
    const memeDownvotes = userMemes.reduce((acc: number, m: any) => acc + ((m as any).dislikes_count || (m as any).downvotes_count || 0), 0);
    const mostPopularMeme = userMemes.length > 0 ? [...userMemes].sort((a: any, b: any) => (((b as any).likes_count || (b as any).upvotes_count || 0) - ((a as any).likes_count || (a as any).upvotes_count || 0)))[0] : null;

    // Brand Stats
    const brandsOwned = userBrands.length;
    const verifiedBrands = userBrands.filter((b: any) => (b.verification_status || "").toLowerCase() === "verified").length;
    const pendingBrands = userBrands.filter((b: any) => (b.verification_status || "").toLowerCase() !== "verified").length;

    // 2. XP Calculation Rules
    // Brand Created: +10 XP
    const brandCreatedXP = brandsOwned * 10;
    // Verified Brand: +25 XP
    const verifiedBrandXP = verifiedBrands * 25;
    // Template Uploaded: +1 XP
    const templateUploadedXP = totalTemplates * 1;
    // Approved Public Template: +1 XP
    const templateApprovedXP = approvedTemplates * 1;
    // Template Upvotes (+1) & Downvotes (-1)
    const templateVotesXP = Math.max(0, templateUpvotes - templateDownvotes);
    // Meme Generated: +1 XP
    const memeGeneratedXP = totalMemes * 1;
    // Meme Upvotes (+1) & Downvotes (-1)
    const memeVotesXP = Math.max(0, memeUpvotes - memeDownvotes);
    // Daily Streak XP (Day N = +N, sum = N * (N + 1) / 2)
    const streakXP = Math.round((currentStreak * (currentStreak + 1)) / 2);
    // Following another user: +1 XP (first time)
    const followingXP = followingCount > 0 ? 1 : 0;
    // Follower gained: +2 XP
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

    const totalXP = Math.max(0, rawTotalXP);
    const calculatedLevel = this.calculateLevel(totalXP);

    // Trust Score Calculation
    const emailVerified = Boolean(dbUser?.emailVerified || (dbUser as any)?.email_verified);
    const connectedProvidersCount = Array.isArray(accounts) ? accounts.length : 0;
    const calculatedTrustScore = this.calculateTrustScore({
      emailVerified,
      connectedProvidersCount,
      verifiedBrandsCount: verifiedBrands,
      approvedTemplatesCount: approvedTemplates,
    });

    // 3. XP Breakdown & Percentages
    const rawBreakdown = [
      { id: "brand-created", name: "Brand Workspace Created", category: "Brands", points: brandCreatedXP, count: brandsOwned, color: "bg-blue-600" },
      { id: "verified-brand", name: "Verified Brand Badge", category: "Brands", points: verifiedBrandXP, count: verifiedBrands, color: "bg-emerald-600" },
      { id: "template-upload", name: "Templates Uploaded & Approved", category: "Templates", points: templateUploadedXP + templateApprovedXP, count: totalTemplates, color: "bg-purple-600" },
      { id: "template-upvotes", name: "Template Community Upvotes", category: "Templates", points: templateVotesXP, count: templateUpvotes, color: "bg-purple-500" },
      { id: "meme-generated", name: "Memes Generated", category: "Memes", points: memeGeneratedXP, count: totalMemes, color: "bg-amber-500" },
      { id: "meme-upvotes", name: "Meme Community Upvotes", category: "Memes", points: memeVotesXP, count: memeUpvotes, color: "bg-amber-600" },
      { id: "streak-xp", name: "Daily Streak Rewards", category: "Streaks", points: streakXP, count: currentStreak, color: "bg-indigo-600" },
      { id: "community-followers", name: "Community Followers Gained", category: "Community", points: followerXP + followingXP, count: followerCount, color: "bg-[var(--theme-accent)]" },
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

    // 4. Dynamic Achievement Evaluation & Badge Unlocking
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
        currentCount: totalXP,
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

      // Auto-award badge in DB if unlocked and not recorded yet
      if (isUnlocked && !unlockedBadgeSlugs.has(def.slug)) {
        await badgeRepository.awardBadgeBySlug(userId, def.slug).catch(() => null);
      }
    }

    // 5. Database Synchronization (Update users & userStats single source of truth)
    await Promise.all([
      userRepository.update(userId, {
        contributor_score: totalXP,
        trust_score: calculatedTrustScore,
      } as any).catch(() => null),

      statsRepository.upsertUserStats(userId, {
        current_xp: totalXP,
        current_level: calculatedLevel,
        memes_generated: totalMemes,
        likes_received: templateUpvotes + memeUpvotes,
        current_streak: currentStreak,
      }).catch(() => null),

      xpRepository.updateLevel(userId, calculatedLevel, totalXP, totalXP, calculatedLevel * 100).catch(() => null),
    ]);

    return {
      userId,
      user: {
        id: userId,
        name: dbUser?.name || "Virlio Creator",
        username: dbUser?.username || "creator",
        email: dbUser?.email || "",
        emailVerified,
      },
      xp: totalXP,
      level: calculatedLevel,
      currentStreak,
      longestStreak,
      trustScore: calculatedTrustScore,
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
      community: {
        followers: followerCount,
        following: followingCount,
      },
      xpBreakdown,
      achievements,
      activities: activities || [],
    };
  }

  /**
   * Batch recalculate all users (One-time repair & synchronization script)
   */
  async batchRecalculateAllUsers(): Promise<{ totalUsers: number; repaired: number }> {
    const allUsers = await db.query.users.findMany();
    let repaired = 0;

    for (const u of allUsers) {
      if (u.id) {
        await this.recalculateUserAnalytics(u.id);
        repaired++;
      }
    }

    return { totalUsers: allUsers.length, repaired };
  }
}

export const userAnalyticsEngine = new XPAnalyticsEngine();
