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
      aggregatedCounts,
      userBrands,
      followerCount,
      followingCount,
      userBadgesList,
    ] = await Promise.all([
      userRepository.findById(userId).catch(() => null),
      accountRepository.findByUserId(userId).catch(() => []),
      userRepository.getAggregatedUserCounts(userId).catch(() => ({
        brands_owned: 0, verified_brands: 0, total_templates: 0, approved_templates: 0,
        template_upvotes: 0, total_memes: 0, meme_upvotes: 0,
      })),
      brandRepository.findByOwner(userId).catch(() => []),
      followRepository.getFollowerCount(userId).catch(() => 0),
      followRepository.getFollowingCount(userId).catch(() => 0),
      badgeRepository.findByUser(userId).catch(() => []),
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

    // Templates (computed via single SQL aggregation query)
    const totalTemplates = aggregatedCounts.total_templates;
    const approvedTemplates = aggregatedCounts.approved_templates;
    const pendingTemplates = 0;
    const rejectedTemplates = 0;
    const templateViews = 0;
    const templateUpvotes = aggregatedCounts.template_upvotes;
    const templateDownvotes = 0;
    const templateApprovalRate = totalTemplates > 0 ? Math.round((approvedTemplates / totalTemplates) * 100) : 0;
    const mostPopularTemplate = null;

    // Memes (computed via single SQL aggregation query)
    const totalMemes = aggregatedCounts.total_memes;
    const publicMemes = totalMemes;
    const privateMemes = 0;
    const memeUpvotes = aggregatedCounts.meme_upvotes;
    const memeDownvotes = 0;
    const mostPopularMeme = null;

    // Brands (computed via single SQL aggregation query)
    const brandsOwned = aggregatedCounts.brands_owned;
    const verifiedBrands = aggregatedCounts.verified_brands;
    const pendingBrands = Math.max(0, brandsOwned - verifiedBrands);

    // 4. XP Engine Official Rules
    const unlockedBadgesCount = (userBadgesList || []).length;
    const badgeUnlockedXP = unlockedBadgesCount * 15;
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
      badgeUnlockedXP +
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
      { id: "badge-unlocked", name: "Badges & Achievements Unlocked", category: "Badges", points: badgeUnlockedXP, count: unlockedBadgesCount, color: "bg-purple-600" },
      { id: "brand-created", name: "Brand Workspace Created", category: "Brands", points: brandCreatedXP, count: brandsOwned, color: "bg-blue-600" },
      { id: "verified-brand", name: "Verified Brand Badge", category: "Brands", points: verifiedBrandXP, count: verifiedBrands, color: "bg-emerald-600" },
      { id: "template-upload", name: "Templates Uploaded & Approved", category: "Templates", points: templateUploadedXP + templateApprovedXP, count: totalTemplates, color: "bg-purple-500" },
      { id: "template-upvotes", name: "Template Community Upvotes", category: "Templates", points: templateVotesXP, count: templateUpvotes, color: "bg-purple-400" },
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

    // 6. Dynamic Achievement Evaluation (strictly aligned with official 13 system badges)
    const achievementDefinitions = [
      {
        id: "early-adopter",
        name: "Early Adopter",
        slug: "early-adopter",
        description: "Recognizes pioneer creators and brands who join Virlio during the launch phase.",
        icon: "Sparkles",
        reqCount: 1,
        currentCount: dbUser?.created_at ? 1 : 0,
      },
      {
        id: "verified-brand",
        name: "Verified Brand",
        slug: "verified-brand",
        description: "Official verification mark confirming legitimate business ownership and domain authenticity.",
        icon: "ShieldCheck",
        reqCount: 1,
        currentCount: verifiedBrands,
      },
      {
        id: "top-contributor",
        name: "Top Contributor",
        slug: "top-contributor",
        description: "Awarded to elite template creators whose submissions consistently drive high engagement.",
        icon: "Award",
        reqCount: 1000,
        currentCount: xp,
      },
      {
        id: "100-templates",
        name: "100 Templates Uploaded",
        slug: "100-templates",
        description: "Celebrates creators who have contributed 100 high-quality, AI-approved meme templates.",
        icon: "Layers",
        reqCount: 100,
        currentCount: approvedTemplates,
      },
      {
        id: "500-templates",
        name: "500 Templates Uploaded",
        slug: "500-templates",
        description: "A major milestone badge for prolific creators supplying 500 approved template formats.",
        icon: "Layers",
        reqCount: 500,
        currentCount: approvedTemplates,
      },
      {
        id: "1000-templates",
        name: "1,000 Templates Uploaded",
        slug: "1000-templates",
        description: "Exclusive badge reserved for legendary creators who have reached 1,000 published templates.",
        icon: "Layers",
        reqCount: 1000,
        currentCount: approvedTemplates,
      },
      {
        id: "100-memes",
        name: "100 Memes Generated",
        slug: "100-memes",
        description: "Awarded to active brands and creators who have rendered 100 marketing memes.",
        icon: "Sparkles",
        reqCount: 100,
        currentCount: totalMemes,
      },
      {
        id: "1000-memes",
        name: "1,000 Memes Generated",
        slug: "1000-memes",
        description: "Recognizes high-velocity brand marketing teams that have produced 1,000 AI-powered memes.",
        icon: "Sparkles",
        reqCount: 1000,
        currentCount: totalMemes,
      },
      {
        id: "10k-memes",
        name: "10,000 Memes Generated",
        slug: "10k-memes",
        description: "The ultimate generation milestone badge representing 10,000 high-converting brand memes.",
        icon: "Sparkles",
        reqCount: 10000,
        currentCount: totalMemes,
      },
      {
        id: "community-favorite",
        name: "Community Favorite",
        slug: "community-favorite",
        description: "Awarded when your uploaded templates receive exceptional community upvotes.",
        icon: "Heart",
        reqCount: 10000,
        currentCount: templateUpvotes + memeUpvotes,
      },
      {
        id: "ai-approved",
        name: "AI Approved",
        slug: "ai-approved",
        description: "Signifies flawless compliance history with automated AI guardrail approval rating.",
        icon: "CheckCircle",
        reqCount: 50,
        currentCount: approvedTemplates,
      },
      {
        id: "trend-setter",
        name: "Trend Setter",
        slug: "trend-setter",
        description: "Granted to creators who submit a template format that goes viral on public leaderboards.",
        icon: "Zap",
        reqCount: 1,
        currentCount: approvedTemplates > 0 ? 1 : 0,
      },
      {
        id: "hall-of-fame",
        name: "Hall of Fame",
        slug: "hall-of-fame",
        description: "The highest honor on Virlio. Inducts top historical contributors and all-time leading brands.",
        icon: "Trophy",
        reqCount: 1000000,
        currentCount: templateViews,
      },
    ];

    const unlockedBadgeSlugs = new Set((userBadgesList || []).map((ub: any) => ub.badge?.slug || ub.badge_id));
    const achievements: DynamicAchievement[] = [];

    for (const def of achievementDefinitions) {
      const isUnlocked = unlockedBadgeSlugs.has(def.slug) || (def.reqCount > 0 && def.currentCount >= def.reqCount);
      const progress = isUnlocked ? 100 : Math.min(99, Math.round((def.currentCount / def.reqCount) * 100));

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
        let unlockDate = new Date();
        if (def.slug === "verified-brand") {
          const verifiedBrandObj = userBrands.find((b: any) => (b.verification_status || "").toLowerCase() === "verified");
          if (verifiedBrandObj?.updated_at || verifiedBrandObj?.created_at) {
            unlockDate = new Date(verifiedBrandObj.updated_at || verifiedBrandObj.created_at);
          }
        } else if (def.slug === "early-adopter" && dbUser?.created_at) {
          unlockDate = new Date(dbUser.created_at);
        }

        // Non-blocking async badge award
        void badgeRepository.awardBadgeBySlug(userId, def.slug, unlockDate).catch(() => null);
      }
    }

    // 7. Non-blocking asynchronous sync of scores (prevents blocking read responses)
    void Promise.all([
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
    ]).catch(() => null);

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
