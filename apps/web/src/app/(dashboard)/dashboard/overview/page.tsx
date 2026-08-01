import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  userRepository,
  memeRepository,
  brandRepository,
} from "@/server/repositories";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";
import { activityEngine } from "@/server/services/activity-engine.service";
import { OverviewHeader } from "@/components/dashboard/overview-header";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { OverviewRecentMemes } from "@/components/dashboard/overview-recent-memes";
import { OverviewActivity } from "@/components/dashboard/overview-activity";
import { OverviewAccountSummary } from "@/components/dashboard/overview-account-summary";
import { OverviewQuickActions } from "@/components/dashboard/overview-quick-actions";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Server-side parallel data fetching from single source of truth
  const [dbUser, userStats, userMemes, userBrands, rawActivities] = await Promise.all([
    userRepository.findById(userId).catch(() => null),
    userStatsEngine.getUserStatistics(userId).catch(() => null),
    memeRepository.findByGenerator(userId, { limit: 6 }).catch(() => []),
    brandRepository.findByOwner(userId).catch(() => []),
    activityEngine.getActivityTimeline(userId, 5).catch(() => []),
  ]);

  const userActivities = rawActivities.map((a) => ({
    id: a.id,
    activity_type: a.type as any,
    created_at: a.created_at,
    metadata: a.metadata,
    action: a.label,
    details: { message: a.label },
  }));

  const userProfile = {
    id: userId,
    name: session.user.name || dbUser?.name || null,
    username: dbUser?.username || session.user.username || null,
    email: session.user.email || dbUser?.email || null,
    image: session.user.image || dbUser?.image || null,
    role: dbUser?.role || session.user.role || "user",
    trust_score: userStats?.trustScore ?? dbUser?.trust_score ?? 100,
    contributor_score: userStats?.xp ?? dbUser?.contributor_score ?? 0,
    account_status: dbUser?.account_status || "active",
  };

  const overviewStats = {
    totalMemes: userStats?.memes.total ?? userMemes.length,
    totalBrands: userBrands.length,
    totalUpvotes: (userStats?.templates.upvotes || 0) + (userStats?.memes.upvotes || 0),
    currentStreak: userStats?.currentStreak ?? 0,
    level: userStats?.level ?? 1,
    xpPoints: userStats?.xp ?? 0,
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header with Greeting & Quick CTAs */}
      <OverviewHeader user={userProfile} />

      {/* 2. KPI Summary Stat Cards */}
      <OverviewStats stats={overviewStats} />

      {/* 3. Main Operational Content Grid (2 Columns on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column: Recent Memes & Live Activity Feed (2 Cols Wide) */}
        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <OverviewRecentMemes memes={userMemes} />
          <OverviewActivity activities={userActivities} />
        </div>

        {/* Right Column: Account Snapshot & Quick Action Shortcuts (1 Col Wide) */}
        <div className="space-y-6 sm:space-y-8">
          <OverviewAccountSummary user={userProfile} />
          <OverviewQuickActions />
        </div>
      </div>
    </div>
  );
}
