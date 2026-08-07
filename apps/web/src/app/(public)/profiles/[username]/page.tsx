import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ActivityContributionGrid } from "@/components/profile/activity-contribution-grid";
import { ProfileFollowButton } from "@/components/profile/profile-follow-button";
import { ProfileTabSwitcher } from "@/components/profile/profile-tab-switcher";
import { userRepository, followRepository, brandRepository, memeRepository, templateRepository, badgeRepository } from "@/server/repositories";
import { authService } from "@/server/services";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";
import {
  Calendar,
  ShieldCheck,
  User,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Flame,
  ThumbsUp,
  Users,
  Settings,
  Share2,
  MapPin,
  Globe,
  Building2,
  Trophy,
  Award,
  ExternalLink,
  Layers,
  Lock,
} from "lucide-react";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  const user = await userRepository.findByUsername(username);

  if (!user) {
    return {
      title: "User Not Found — Virlio",
    };
  }

  const displayName = user.name || `@${user.username}`;
  return {
    title: `${displayName} (@${user.username}) — Virlio Profile`,
    description: user.bio || `Check out ${displayName}'s viral memes, brand workspaces, and community templates on Virlio.`,
  };
}

export default async function UserProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const dbUser = await userRepository.findByUsername(username);

  if (!dbUser) {
    notFound();
  }

  const [session, stats, userBrands, userMemes, userTemplates, userBadges, followerCount, followingCount, isFollowing] = await Promise.all([
    authService.getCurrentSession(),
    userStatsEngine.getUserStatistics(dbUser.id),
    brandRepository.findByOwner(dbUser.id).catch(() => []),
    memeRepository.findByGenerator(dbUser.id, { limit: 50 }).catch(() => []),
    templateRepository.findByContributor(dbUser.id, { limit: 50 }).catch(() => []),
    badgeRepository.findByUser(dbUser.id).catch(() => []),
    followRepository.getFollowerCount(dbUser.id).catch(() => 0),
    followRepository.getFollowingCount(dbUser.id).catch(() => 0),
    authService.getCurrentSession().then(s => s?.user?.id ? followRepository.isFollowing(s.user.id, dbUser.id, "user").catch(() => false) : false),
  ]);

  const currentUserId = session?.user?.id;
  const isOwnProfile = currentUserId === dbUser.id;
  const displayName = dbUser.name || (dbUser.username ? `@${dbUser.username}` : "Virlio Creator");
  const usernameHandle = dbUser.username ? `@${dbUser.username}` : dbUser.email || "";

  // Dynamic Person JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": displayName,
      "alternateName": usernameHandle,
      "url": `https://virlio.iteebot.com/profiles/${dbUser.username}`,
      "image": dbUser.image || "https://virlio.iteebot.com/images/logo-vertical.png",
      "description": dbUser.bio,
      "knowsAbout": ["AI Meme Generation", "Social Media Branding", "Viral Marketing"],
    },
  };

  const level = stats.level;
  const nextLevelXp = stats.nextLevelXp;
  const xp = stats.xp;
  const levelProgress = stats.levelProgress;
  const achievements = stats.achievements || [];

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore Feed</span>
            </Link>
          </div>

          {/* 1. SECTION 1: PROFILE IDENTITY HERO CARD */}
          <div className="virlio-surface p-6 sm:p-10 border border-gray-200 rounded-3xl shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <UserAvatar
                  src={dbUser.image}
                  name={displayName}
                  username={dbUser.username}
                  size="xl"
                  isCurrentUser={isOwnProfile}
                  priority
                />

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {displayName}
                    </h1>

                    {userBrands.some((b: any) => (b.verification_status || "").toLowerCase() === "verified") ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Brand Owner</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verified Contributor</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-500">
                    {usernameHandle}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                    {dbUser.bio || "AI Content Creator on Virlio."}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Member since {dbUser.created_at ? new Date(dbUser.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently"}</span>
                    </span>

                    {dbUser.country && (
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{dbUser.country}</span>
                      </span>
                    )}

                    {dbUser.website && (
                      <a
                        href={dbUser.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>{dbUser.website.replace(/^https?:\/\//, "")}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                {isOwnProfile ? (
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
                  >
                    <Settings className="w-4 h-4 text-gray-500" />
                    <span>Profile Settings</span>
                  </Link>
                ) : (
                  <ProfileFollowButton
                    targetUserId={dbUser.id}
                    targetUsername={dbUser.username || "creator"}
                    initialIsFollowing={isFollowing}
                    initialFollowerCount={followerCount}
                  />
                )}
              </div>
            </div>

            {/* KEY REPUTATION STATISTICS BAR */}
            <div className="pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center bg-white p-4 rounded-2xl border border-gray-200">
              <div className="px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-indigo-600 mb-0.5">
                  <Users className="w-4 h-4" />
                  <span className="text-base font-extrabold">{followerCount}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Followers</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-gray-700 mb-0.5">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-base font-extrabold">{followingCount}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Following</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-base font-extrabold">{stats.memes.upvotes + stats.templates.upvotes}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Upvotes</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
                  <Flame className="w-4 h-4" />
                  <span className="text-base font-extrabold">{stats.currentStreak}d</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Current Streak</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-base font-extrabold">{stats.trustScore}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Trust Score</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-0.5">
                  <Award className="w-4 h-4" />
                  <span className="text-base font-extrabold">{stats.xp}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Contributor</p>
              </div>
            </div>
          </div>

          {/* 2. LEVEL & XP PROGRESSION CARD */}
          <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      Level {level} Creator
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {xp} XP earned / {nextLevelXp} XP required for Level {level + 1}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-semibold text-gray-700">
                <span>Progress: {levelProgress}%</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${levelProgress}%` }}
              />
            </div>
          </div>

          {/* 3. COMMUNITY BADGES & ACHIEVEMENTS SECTION */}
          <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-bold text-gray-900">Earned Badges & Achievements</h2>
              </div>
              <span className="text-xs font-bold text-gray-500">
                {achievements.filter((a: any) => a.unlocked).length} / {achievements.length} Unlocked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {achievements.map((a: any) => (
                <div
                  key={a.id}
                  className={`p-3 rounded-2xl border text-center space-y-2 transition ${
                    a.unlocked
                      ? "bg-purple-50/50 border-purple-200 text-purple-900"
                      : "bg-gray-50 border-gray-200 text-gray-400 opacity-60"
                  }`}
                  title={a.description}
                >
                  <div className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center bg-white border border-gray-200 shadow-2xs">
                    {a.unlocked ? (
                      <Award className="w-4 h-4 text-purple-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <p className="text-[11px] font-bold truncate">{a.name}</p>
                  <p className="text-[9px] font-medium text-gray-500">
                    {a.unlocked ? "Unlocked" : `${a.progress}%`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* 4. STREAK SYSTEM & CONTRIBUTION CALENDAR */}
          <ActivityContributionGrid
            currentStreak={stats.currentStreak}
            longestStreak={stats.longestStreak}
            createdAt={dbUser.created_at}
            activityTimeline={stats.timeline}
            contributionCalendar={stats.contributionCalendar}
          />

          {/* 5. TABBED CONTENT NAVIGATOR */}
          <ProfileTabSwitcher
            memes={userMemes}
            templates={userTemplates}
            brands={userBrands}
            activityTimeline={stats.timeline}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
