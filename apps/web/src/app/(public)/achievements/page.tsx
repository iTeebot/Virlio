"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  Award,
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Filter,
  ArrowRight,
  Loader2,
  UserCheck,
  LogIn,
} from "lucide-react";

interface BadgeDef {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  criteria: string;
  reward: string;
}

const ALL_BADGES: BadgeDef[] = [
  {
    id: "early-adopter",
    title: "Early Adopter",
    category: "Special",
    image: "/images/badges/badge_Early_adopter.png",
    description: "Recognizes pioneer creators and brands who joined Virlio during the initial platform launch phase.",
    criteria: "Register a brand or contributor profile on Virlio.",
    reward: "Permanent Early Adopter profile flair, +250 XP bonus, priority support.",
  },
  {
    id: "top-contributor",
    title: "Top Contributor",
    category: "Community",
    image: "/images/badges/badge_Top_Contributer.png",
    description: "Awarded to elite template creators whose submissions consistently drive high engagement and downloads.",
    criteria: "Reach the top 5% of monthly template contributors based on community downloads.",
    reward: "Top Contributor profile badge, +1,000 XP, feature in weekly digest.",
  },
  {
    id: "verified-brand",
    title: "Verified Brand",
    category: "Trust & Safety",
    image: "/images/badges/badge_Verified_Brand.png",
    description: "Official verification mark confirming legitimate business ownership and domain authenticity.",
    criteria: "Complete AI Brand Verification with website and registry validation.",
    reward: "Verified Checkmark on all memes, access to advanced AI generator, +500 XP.",
  },
  {
    id: "100-templates",
    title: "100 Templates Uploaded",
    category: "Milestones",
    image: "/images/badges/badge_100Templates.png",
    description: "Celebrates creators who have contributed 100 high-quality, AI-approved meme templates to the community.",
    criteria: "Upload 100 templates that successfully pass automated moderation.",
    reward: "Template Architect badge, +500 XP, custom creator link.",
  },
  {
    id: "500-templates",
    title: "500 Templates Uploaded",
    category: "Milestones",
    image: "/images/badges/badge_500_Templates.png",
    description: "A major milestone badge for prolific creators supplying the platform with 500 approved template formats.",
    criteria: "Upload 500 community-approved meme templates.",
    reward: "Master Template Creator badge, +1,500 XP, expanded analytics.",
  },
  {
    id: "1000-templates",
    title: "1,000 Templates Uploaded",
    category: "Milestones",
    image: "/images/badges/badge_1000_Templates.png",
    description: "Exclusive badge reserved for legendary creators who have reached 1,000 published meme templates.",
    criteria: "Publish 1,000 approved meme templates in the public library.",
    reward: "Legendary Creator badge, +3,000 XP, dedicated profile showcase.",
  },
  {
    id: "100-memes",
    title: "100 Memes Generated",
    category: "Generation",
    image: "/images/badges/badge_100Memes.png",
    description: "Awarded to active brands and creators who have rendered and generated 100 marketing memes.",
    criteria: "Generate 100 memes using the Virlio AI generator.",
    reward: "Meme Producer badge, +300 XP, custom font access.",
  },
  {
    id: "1000-memes",
    title: "1,000 Memes Generated",
    category: "Generation",
    image: "/images/badges/badge_1000_Memes.png",
    description: "Recognizes high-velocity brand marketing teams that have produced 1,000 AI-powered memes.",
    criteria: "Generate 1,000 memes under a verified brand workspace.",
    reward: "Content Machine badge, +1,200 XP, batch export tools.",
  },
  {
    id: "10k-memes",
    title: "10,000 Memes Generated",
    category: "Generation",
    image: "/images/badges/badge_10kMemes.png",
    description: "The ultimate generation milestone badge representing 10,000 high-converting brand memes produced.",
    criteria: "Reach 10,000 total meme generations.",
    reward: "Viral Powerhouse badge, +5,000 XP, VIP agency support.",
  },
  {
    id: "community-favorite",
    title: "Community Favorite",
    category: "Virality",
    image: "/images/badges/badge_Community_Favorite.png",
    description: "Awarded when your uploaded template or meme receives exceptional community upvotes and bookmarks.",
    criteria: "Accumulate 10,000+ total upvotes across your published templates.",
    reward: "Community Favorite badge, +1,000 XP, home page featuring.",
  },
  {
    id: "ai-approved",
    title: "AI Approved",
    category: "Trust & Safety",
    image: "/images/badges/badge_AI_Approved.png",
    description: "Signifies flawless compliance history with 100% automated AI guardrail approval rating.",
    criteria: "Maintain 50+ consecutive template submissions with 0 moderation flags.",
    reward: "AI Approved Trust Shield, +400 XP, instant publishing queue.",
  },
  {
    id: "trend-setter",
    title: "Trend Setter",
    category: "Virality",
    image: "/images/badges/badge_Trend_Setter.png",
    description: "Granted to creators who submit a new template format that goes viral on public leaderboards within 48 hours.",
    criteria: "Submit a template that hits the Top 3 Trending Leaderboard in under 48 hours.",
    reward: "Trend Setter badge, +1,500 XP, viral trend spotlight.",
  },
  {
    id: "hall-of-fame",
    title: "Hall of Fame",
    category: "Special",
    image: "/images/badges/badge_Hall_of_Fame.png",
    description: "The highest honor on Virlio. Inducts top 10 historical contributors and all-time leading brands.",
    criteria: "Reach Top 10 All-Time Leaderboard ranking or 1,000,000+ total template downloads.",
    reward: "Hall of Fame Gold Trophy, +10,000 XP, permanent platform induction.",
  },
];

export default function AchievementsPage() {
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Real User Achievement States
  const [unlockedBadges, setUnlockedBadges] = useState<string[]>([]);
  const [totalXp, setTotalXp] = useState<number>(0);
  const [levelInfo, setLevelInfo] = useState<{
    level: number;
    title: string;
    minXp: number;
    maxXp: number;
  }>({
    level: 1,
    title: "Novice Creator",
    minXp: 0,
    maxXp: 250,
  });
  const [loadingData, setLoadingData] = useState<boolean>(false);

  useEffect(() => {
    if (status === "authenticated") {
      setLoadingData(true);
      fetch("/api/v1/users/achievements")
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.data) {
            if (json.data.unlockedBadges) setUnlockedBadges(json.data.unlockedBadges);
            if (json.data.totalXp !== undefined) setTotalXp(json.data.totalXp);
            if (json.data.levelInfo) setLevelInfo(json.data.levelInfo);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [status]);

  const categories = ["All", "Milestones", "Generation", "Trust & Safety", "Virality", "Special"];

  const filteredBadges = ALL_BADGES.filter((b) =>
    selectedCategory === "All" ? true : b.category === selectedCategory
  );

  const isAuthenticated = status === "authenticated" && !!session?.user;
  const unlockedCount = unlockedBadges.length;

  // XP Progress Percentage
  const currentLevelMin = levelInfo.minXp;
  const currentLevelMax = levelInfo.maxXp;
  const xpProgress = Math.min(
    100,
    Math.max(0, Math.round(((totalXp - currentLevelMin) / (currentLevelMax - currentLevelMin)) * 100))
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-4">
              <Award className="w-3.5 h-3.5 text-blue-600" />
              <span>Gamification & Reputation System</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
              Badges & Achievements
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Earn recognition, unlock platform perks, and level up your creator or brand status. Explore all 13 official Virlio achievements, criteria, and rewards.
            </p>
          </div>

          {/* User Progress Summary Card (LOGGED IN vs NOT LOGGED IN) */}
          {isAuthenticated ? (
            <div className="virlio-surface p-6 sm:p-8 mb-12 border border-gray-200 max-w-4xl mx-auto">
              {loadingData ? (
                <div className="py-8 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Loading your achievement stats...</span>
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs shrink-0">
                        <Trophy className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-lg font-bold text-gray-900">
                            Level {levelInfo.level} {levelInfo.title}
                          </p>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active Session
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                          {totalXp} / {levelInfo.maxXp} XP to Level {levelInfo.level + 1}
                        </p>
                      </div>
                    </div>

                    {/* Real Stats Badges */}
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-2xl font-extrabold text-gray-900">
                          {unlockedCount} / {ALL_BADGES.length}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Badges Unlocked</p>
                      </div>
                      <div className="h-8 w-px bg-gray-200" />
                      <div>
                        <p className="text-2xl font-extrabold text-blue-600">{totalXp}</p>
                        <p className="text-xs text-gray-500 font-medium">Total XP Earned</p>
                      </div>
                    </div>
                  </div>

                  {/* Real Progress Bar */}
                  <div className="mt-6">
                    <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${xpProgress}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Unauthenticated Visitor Banner - Explains Badges without Fake Stats */
            <div className="virlio-surface p-6 sm:p-8 mb-12 border border-gray-200 max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xl shrink-0">
                    <Award className="w-7 h-7 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Explore Virlio Creator Badges
                    </h2>
                    <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-lg">
                      Sign in to your Virlio account to track your unlocked achievements, level progression, and total earned XP.
                    </p>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>Sign In to Track Badges</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
            <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 text-xs font-semibold rounded-xl shrink-0 transition-colors ${
                  selectedCategory === cat
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 13 Badges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBadges.map((badge) => {
              const isUnlocked = isAuthenticated && unlockedBadges.includes(badge.id);

              return (
                <div
                  key={badge.id}
                  className={`virlio-card p-6 flex flex-col justify-between relative overflow-hidden transition-all ${
                    isAuthenticated
                      ? isUnlocked
                        ? "border-emerald-200 bg-white"
                        : "opacity-80 bg-gray-50/50 border-gray-200"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div>
                    {/* Top Status & Category Badge */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {badge.category}
                      </span>

                      {/* Render Locked/Unlocked ONLY when Authenticated */}
                      {isAuthenticated && (
                        isUnlocked ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Unlocked</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                            <Lock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Locked</span>
                          </span>
                        )
                      )}
                    </div>

                    {/* Badge Image */}
                    <div className="relative w-36 h-36 mx-auto mb-6 flex items-center justify-center">
                      <Image
                        src={badge.image}
                        alt={`${badge.title} Badge Icon`}
                        fill
                        sizes="144px"
                        className={`object-contain transition-transform duration-200 hover:scale-105 ${
                          isAuthenticated && !isUnlocked ? "grayscale opacity-75" : "drop-shadow-md"
                        }`}
                      />
                    </div>

                    {/* Title & Description */}
                    <h2 className="text-lg font-bold text-gray-900 text-center mb-2">{badge.title}</h2>
                    <p className="text-xs text-gray-600 text-center leading-relaxed mb-4">{badge.description}</p>

                    {/* How to Achieve Criteria */}
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-200 text-xs space-y-1.5 mb-4">
                      <p className="font-bold text-gray-900 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        <span>How to Achieve:</span>
                      </p>
                      <p className="text-gray-600 leading-relaxed">{badge.criteria}</p>
                    </div>
                  </div>

                  {/* Reward Line */}
                  <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
                    <span className="font-semibold text-gray-700">Reward:</span>
                    <span className="text-blue-600 font-bold">{badge.reward.split(",")[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Gamification Info CTA */}
          <div className="mt-16 virlio-surface p-8 sm:p-10 border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Want to Display Badges on Your Profile?
            </h2>
            <p className="mt-2 max-w-xl mx-auto text-sm text-gray-600">
              Verified brands and creators automatically showcase earned achievements on public profile cards and template listings.
            </p>
            <div className="mt-6 flex justify-center gap-4">
              <Link
                href="/dashboard/generator"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-sm font-semibold text-white transition-colors"
              >
                <span>Start Earning Achievements</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
