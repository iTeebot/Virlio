import React from "react";
import { redirect } from "next/navigation";
import { userService, authService } from "@/server/services";
import { OverviewHeader } from "@/components/dashboard/overview-header";
import { OverviewStats } from "@/components/dashboard/overview-stats";
import { OverviewRecentMemes } from "@/components/dashboard/overview-recent-memes";
import { OverviewActivity } from "@/components/dashboard/overview-activity";
import { OverviewAccountSummary } from "@/components/dashboard/overview-account-summary";
import { OverviewQuickActions } from "@/components/dashboard/overview-quick-actions";

export const dynamic = "force-dynamic";

export default async function OverviewPage() {
  const session = await authService.getCurrentSession();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  // Single canonical data access for authenticated user profile & overview stats
  const profileData = await userService.getCurrentUserProfile(userId);

  if (!profileData) {
    redirect("/login");
  }

  const { user, stats, userBrands, userMemes, userActivities } = profileData;

  const userProfile = {
    id: userId,
    name: session.user.name || user.name || null,
    username: user.username || session.user.username || null,
    email: session.user.email || user.email || null,
    image: session.user.image || user.image || null,
    role: user.role || session.user.role || "user",
    trust_score: user.trust_score,
    contributor_score: user.contributor_score,
    account_status: user.account_status,
  };

  const overviewStats = {
    totalMemes: stats?.memes.total ?? userMemes.length,
    totalBrands: userBrands.length,
    totalUpvotes: (stats?.templates.upvotes || 0) + (stats?.memes.upvotes || 0),
    currentStreak: stats?.currentStreak ?? 0,
    level: stats?.level ?? 1,
    xpPoints: stats?.xp ?? 0,
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
