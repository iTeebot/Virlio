"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { ActivityContributionGrid } from "@/components/profile/activity-contribution-grid";
import { ReportProfileModal } from "@/components/profile/report-profile-modal";
import { ShareProfileModal } from "@/components/profile/share-profile-modal";
import { toast } from "@/components/ui/toast";
import { useTemplateStore } from "@/providers/template-provider";
import { useTemplateVote } from "@/hooks/useTemplateVote";

function ProfileTemplateCard({ t }: { t: any }) {
  const { upvotesCount, isLiked, isPending, handleVote } = useTemplateVote(t.id, {
    upvotes_count: t.upvotes_count,
    currentUserVote: t.currentUserVote,
  });

  return (
    <div key={t.id} className="virlio-card p-4 bg-white border border-gray-200 rounded-3xl space-y-3">
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
        {(t.cloudinary_secure_url || t.image_url) ? (
          <Image src={t.cloudinary_secure_url || t.image_url} alt={t.title || "Template"} fill className="object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-xs text-gray-400">Template Image</div>
        )}
      </div>
      <h4 className="text-xs font-bold text-gray-900 truncate">{t.title}</h4>
      <div className="flex items-center justify-between text-[11px] text-gray-500">
        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-bold">{t.category || "General"}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleVote("upvote")}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition ${
              isLiked ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <ThumbsUp className="w-3 h-3" />
            <span>{upvotesCount}</span>
          </button>
          <Link href={`/templates/${t.slug || t.id}`} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
            <span>Use</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
import {
  Calendar,
  Award,
  ShieldCheck,
  User,
  ArrowLeft,
  Sparkles,
  Layers,
  AlertCircle,
  Flame,
  Zap,
  ThumbsUp,
  Users,
  UserPlus,
  UserCheck,
  Loader2,
  Settings,
  Share2,
  Flag,
  Globe,
  MapPin,
  CheckCircle2,
  ExternalLink,
  Building2,
  Trophy,
  Lock,
  Clock,
  Eye,
  Bookmark,
  TrendingUp,
} from "lucide-react";

interface UserBadgeItem {
  id: string;
  unlocked_at?: string | Date | null;
  badge?: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    category?: string | null;
    icon_url?: string | null;
  } | null;
}

interface ManagedBrand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  description?: string | null;
  industry?: string | null;
  country?: string | null;
  website?: string | null;
  verification_status?: string | null;
  brand_score?: number | null;
}

interface UserProfileData {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  bio?: string | null;
  website?: string | null;
  country?: string | null;
  language?: string | null;
  trust_score?: number | null;
  contributor_score?: number | null;
  account_status?: string | null;
  created_at?: string | Date | null;
  current_streak?: number | null;
  longest_streak?: number | null;
  total_upvotes?: number | null;
  followers_count?: number | null;
  following_count?: number | null;
  total_xp?: number | null;
  level_info?: {
    level: number;
    title: string;
    minXp: number;
    maxXp: number;
  } | null;
  badges?: UserBadgeItem[];
  brands_managed?: ManagedBrand[];
  featured_brand?: ManagedBrand | null;
  public_memes?: any[];
  public_templates?: any[];
  activity_timeline?: Array<{
    id: string;
    type: string;
    label?: string;
    title?: string;
    description?: string;
    created_at: string | Date;
  }>;
  contribution_stats?: {
    templates_uploaded: number;
    templates_approved: number;
    templates_rejected: number;
    memes_generated: number;
    public_memes_count: number;
    total_upvotes: number;
    bookmarks_count: number;
  };
}

function formatMemberSince(dateInput: string | Date | null | undefined): { exact: string; age: string } {
  if (!dateInput) return { exact: "Recently", age: "" };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { exact: "Recently", age: "" };

  const exact = d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - d.getTime());
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let age = "";
  if (diffMins < 60) {
    age = `Joined ${diffMins} ${diffMins === 1 ? "minute" : "minutes"} ago`;
  } else if (diffHours < 24) {
    age = `Joined ${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
  } else {
    age = `Joined ${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
  }

  return { exact, age };
}

function formatUnlockedAt(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Recently";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Recently";

  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function UserPublicProfileContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: authStatus } = useSession();
  const rawUsername = params?.username as string;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Active Content Navigation Tab
  const [activeTab, setActiveTab] = useState<"Memes" | "Templates" | "Brands" | "Activity" | "Achievements">("Memes");

  // Follow State
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const { syncTemplates } = useTemplateStore();

  useEffect(() => {
    if (profile?.public_templates && profile.public_templates.length > 0) {
      syncTemplates(profile.public_templates);
    }
  }, [profile?.public_templates, syncTemplates]);

  useEffect(() => {
    if (!rawUsername) return;

    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/v1/users/check-username?username=${encodeURIComponent(rawUsername)}`);
        const json = await res.json();

        if (json.success && json.data && !json.data.available && json.data.user) {
          const uData = json.data.user;
          setProfile(uData);
          setFollowerCount(uData.followers_count ?? 0);

          // Check real follow status if logged in
          fetch(`/api/v1/users/follow?targetUserId=${uData.id}`)
            .then((r) => r.json())
            .then((fJson) => {
              if (fJson.success && fJson.data) {
                setIsFollowing(!!fJson.data.isFollowing);
                if (fJson.data.followerCount !== undefined) {
                  setFollowerCount(fJson.data.followerCount);
                }
              }
            })
            .catch(() => {});
        } else {
          setNotFound(true);
        }
      } catch (err) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [rawUsername]);

  // Deep-link Action Handling: Auto-follow upon login callback (?action=follow)
  useEffect(() => {
    if (!profile || authStatus !== "authenticated" || !session?.user?.id) return;
    const action = searchParams?.get("action");

    if (action === "follow" && session.user.id !== profile.id) {
      fetch("/api/v1/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profile.id, action: "follow" }),
      })
        .then((r) => r.json())
        .then((json) => {
          if (json.success) {
            setIsFollowing(true);
            if (json.data?.followerCount !== undefined) {
              setFollowerCount(json.data.followerCount);
            }
            toast.success(`You are now following @${rawUsername}!`, "Followed");
            router.replace(`/profiles/${rawUsername}`);
          }
        })
        .catch(() => {});
    }
  }, [profile, authStatus, session, searchParams, rawUsername, router]);

  const handleFollowToggle = async () => {
    if (!profile) return;

    if (authStatus !== "authenticated" || !session?.user) {
      const callbackUrl = `/profiles/${rawUsername}?action=follow`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (session.user.id === profile.id) return;

    setFollowLoading(true);
    const nextAction = isFollowing ? "unfollow" : "follow";

    try {
      const res = await fetch("/api/v1/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profile.id, action: nextAction }),
      });
      const json = await res.json();

      if (json.success) {
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);
        setFollowerCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)));
        if (newStatus) {
          toast.success(`You are now following @${rawUsername}`, "Followed");
        } else {
          toast.info(`Unfollowed @${rawUsername}`, "Unfollowed");
        }
      } else {
        toast.error(json.error || "Failed to update follow status", "Error");
      }
    } catch (err) {
      toast.error("Failed to update follow status.", "Network Error");
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1 py-16 text-center text-xs text-gray-500 font-medium">
          Loading creator profile for @{rawUsername}...
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !profile) {
    return (
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        <Header />
        <main className="flex-1 py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <ErrorPageLayout
              imageSrc="/images/errors/nothing_here_yet.png"
              imageAlt="Profile Not Found Illustration"
              title="Creator Profile Not Found"
              description={`No user or creator account exists with username "@${rawUsername}".`}
              statusBadgeText="404 User Not Found"
              primaryButtonText="Back to Explore Feed"
              primaryButtonHref="/explore"
              secondaryButtonText="View All Contributors"
              secondaryButtonHref="/contributors"
              primaryButtonIconName="explore"
              secondaryButtonIconName="leaderboard"
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const displayName = profile.name || (profile.username ? `@${profile.username}` : "Virlio Creator");
  const usernameHandle = profile.username ? `@${profile.username}` : profile.email || "";
  const role = (profile.role || "USER").toUpperCase();
  const dateInfo = profile.created_at ? formatMemberSince(profile.created_at) : { exact: "Recently", age: "" };
  const userBadges = profile.badges || [];
  const managedBrands = profile.brands_managed || [];
  const featuredBrand = profile.featured_brand;
  const publicMemes = profile.public_memes || [];
  const publicTemplates = profile.public_templates || [];

  const activityTimeline = profile.activity_timeline || [];
  const stats = profile.contribution_stats || {
    templates_uploaded: publicTemplates.length,
    templates_approved: publicTemplates.length,
    templates_rejected: 0,
    memes_generated: publicMemes.length,
    public_memes_count: publicMemes.length,
    total_upvotes: profile.total_upvotes ?? 0,
    bookmarks_count: 0,
  };

  const isOwnProfile = session?.user?.id === profile.id;
  const levelInfo = profile.level_info || { level: 1, title: "Novice Creator", minXp: 0, maxXp: 250 };
  const totalXp = profile.total_xp ?? 0;
  const xpProgress = Math.min(
    100,
    Math.max(0, Math.round(((totalXp - levelInfo.minXp) / (levelInfo.maxXp - levelInfo.minXp)) * 100))
  );

  // Dynamic Person JSON-LD Schema for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "mainEntity": {
      "@type": "Person",
      "name": displayName,
      "alternateName": usernameHandle,
      "url": `https://virlio.iteebot.com/profiles/${profile.username}`,
      "image": profile.image || "https://virlio.iteebot.com/images/logo-vertical.png",
      "description": profile.bio,
      "knowsAbout": ["AI Meme Generation", "Social Media Branding", "Viral Marketing"],
    },
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      {/* Inject JSON-LD Schema */}
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

            <button
              type="button"
              onClick={() => setShareModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-blue-600 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-gray-500" />
              <span>Share Profile</span>
            </button>
          </div>

          {/* 1. SECTION 1: PROFILE IDENTITY HERO CARD */}
          <div className="virlio-surface p-6 sm:p-10 border border-gray-200 rounded-3xl shadow-xs space-y-6">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* User Avatar */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-blue-50 border-4 border-white shadow-md flex items-center justify-center shrink-0">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={displayName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-blue-600" />
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                      {displayName}
                    </h1>

                    {/* Real Verification Badges */}
                    {managedBrands.some((b) => b.verification_status === "verified") ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold"
                        title="Verified Brand Owner on Virlio"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Verified Brand Owner</span>
                      </span>
                    ) : userBadges.length > 0 ? (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold"
                        title="Verified Community Contributor"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Verified Contributor</span>
                      </span>
                    ) : (
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-gray-500 text-xs font-medium cursor-help"
                        title="Account not yet verified"
                      >
                        <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                        <span>Unverified</span>
                      </span>
                    )}

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {role}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-gray-500">
                    {usernameHandle}
                  </p>

                  <p className="text-xs sm:text-sm text-gray-600 max-w-xl leading-relaxed">
                    {profile.bio}
                  </p>

                  {/* Profile Metadata Pills */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap pt-1">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Member since {dateInfo.exact}</span>
                      {dateInfo.age && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 ml-1">
                          ({dateInfo.age})
                        </span>
                      )}
                    </span>

                    {profile.country && (
                      <span className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{profile.country}</span>
                      </span>
                    )}

                    {profile.website && (
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline font-semibold"
                      >
                        <Globe className="w-3.5 h-3.5 text-blue-600" />
                        <span>{profile.website.replace(/^https?:\/\//, "")}</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: PROFILE ACTION BUTTONS */}
              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
                {isOwnProfile ? (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Link
                      href="/dashboard/settings"
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
                    >
                      <Settings className="w-4 h-4 text-gray-500" />
                      <span>Profile Settings</span>
                    </Link>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                        isFollowing
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {followLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShareModalOpen(true)}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors"
                      title="Share Profile"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => setReportModalOpen(true)}
                      className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                      title="Report Profile"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 3: KEY REPUTATION STATISTICS BAR */}
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
                  <span className="text-base font-extrabold">{profile.following_count ?? 0}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Following</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-blue-600 mb-0.5">
                  <ThumbsUp className="w-4 h-4" />
                  <span className="text-base font-extrabold">{profile.total_upvotes ?? 0}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Total Upvotes</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-orange-500 mb-0.5">
                  <Flame className="w-4 h-4" />
                  <span className="text-base font-extrabold">{profile.current_streak ?? 0}d</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Current Streak</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-base font-extrabold">{profile.trust_score ?? 100}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Trust Score</p>
              </div>

              <div className="border-l border-gray-100 px-2 py-1">
                <div className="flex items-center justify-center gap-1 text-purple-600 mb-0.5">
                  <Award className="w-4 h-4" />
                  <span className="text-base font-extrabold">{profile.contributor_score || 0}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-semibold uppercase">Contributor</p>
              </div>
            </div>
          </div>

          {/* 2. SECTION 4: LEVEL & XP PROGRESSION CARD */}
          <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-gray-900">
                      Level {levelInfo.level} — {levelInfo.title}
                    </p>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      XP Rank
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {totalXp} XP earned / {levelInfo.maxXp} XP required for Level {levelInfo.level + 1}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs font-semibold text-gray-700">
                <span>Progress: {xpProgress}%</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/60">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
          </div>

          {/* 3. SECTION 5: STREAK SYSTEM & GITHUB-STYLE CONTRIBUTION CALENDAR */}
          <ActivityContributionGrid
            currentStreak={profile.current_streak ?? 0}
            longestStreak={profile.longest_streak ?? 0}
            createdAt={profile.created_at}
            activityTimeline={activityTimeline}
            contributionCalendar={(profile as any).contribution_calendar}
            contributionDates={(profile as any).contribution_dates}
          />

          {/* 4. SECTION 6: FEATURED BRAND HIGHLIGHT CARD */}
          {featuredBrand && (
            <div className="virlio-card p-6 bg-white border border-blue-200 rounded-3xl shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Featured Brand
                  </span>
                </div>
                {featuredBrand.verification_status === "verified" && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>AI Verified Brand</span>
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                    {featuredBrand.logo_url ? (
                      <Image src={featuredBrand.logo_url} alt={featuredBrand.name} fill className="object-cover" />
                    ) : (
                      <Building2 className="w-7 h-7 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{featuredBrand.name}</h3>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                      {featuredBrand.description || "Official verified business profile on Virlio."}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                      {featuredBrand.industry && <span>Industry: {featuredBrand.industry}</span>}
                      <span>Brand Score: {featuredBrand.brand_score}/100</span>
                    </div>
                  </div>
                </div>

                <Link
                  href={`/brands/${featuredBrand.slug}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shrink-0"
                >
                  <span>View Brand Profile</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}

          {/* 5. SECTION 7: BRANDS MANAGED */}
          {managedBrands.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Brands Managed ({managedBrands.length})</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Official brand workspaces owned or managed by @{profile.username}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {managedBrands.map((b) => (
                  <div key={b.id} className="virlio-card p-5 bg-white border border-gray-200 rounded-3xl flex flex-col justify-between space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="relative w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                        {b.logo_url ? (
                          <Image src={b.logo_url} alt={b.name} fill className="object-cover" />
                        ) : (
                          <Building2 className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-gray-900 truncate">{b.name}</h3>
                          {b.verification_status === "verified" && (
                            <span title="Verified">
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{b.industry || "Business Workspace"}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Brand Score: <strong className="text-gray-900">{b.brand_score}/100</strong></span>
                      <Link href={`/brands/${b.slug}`} className="text-blue-600 hover:underline font-bold flex items-center gap-1">
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. SECTION 8: CONTRIBUTION OVERVIEW */}
          <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Contribution Statistics Overview</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 text-center">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl font-extrabold text-gray-900">{stats.templates_uploaded}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Templates Uploaded</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl font-extrabold text-emerald-600">{stats.templates_approved}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Approved Templates</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl font-extrabold text-blue-600">{stats.memes_generated}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Memes Generated</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl font-extrabold text-indigo-600">{stats.public_memes_count}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Public Memes</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl font-extrabold text-amber-600">{stats.total_upvotes}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Total Upvotes</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-xl font-extrabold text-purple-600">{userBadges.length}</p>
                <p className="text-[10px] text-gray-500 font-semibold uppercase mt-0.5">Unlocked Badges</p>
              </div>
            </div>
          </div>

          {/* 7. SECTION 9: CONTENT NAVIGATION SYSTEM (TABS) */}
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-gray-200">
              {(["Memes", "Templates", "Brands", "Activity", "Achievements"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-5 py-2.5 text-xs font-bold rounded-xl whitespace-nowrap transition-colors ${
                    activeTab === tab
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {tab === "Memes" && `Public Memes (${publicMemes.length})`}
                  {tab === "Templates" && `Templates (${publicTemplates.length})`}
                  {tab === "Brands" && `Brands (${managedBrands.length})`}
                  {tab === "Activity" && `Activity (${activityTimeline.length})`}
                  {tab === "Achievements" && `Badges (${userBadges.length})`}
                </button>
              ))}
            </div>

            {/* TAB 1: MEMES */}
            {activeTab === "Memes" && (
              <div>
                {publicMemes.length === 0 ? (
                  <div className="virlio-card p-8 sm:p-12 text-center bg-white border border-gray-200 rounded-3xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <Layers className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No public memes generated yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Public memes created by @{profile.username} will appear here automatically.
                    </p>
                    <div className="pt-2">
                      <Link href="/dashboard/generator" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white">
                        <span>Generate Meme</span>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {publicMemes.map((m) => (
                      <div key={m.id} className="virlio-card p-4 bg-white border border-gray-200 rounded-3xl space-y-3">
                        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                          {m.image_url ? (
                            <Image src={m.image_url} alt={m.title || "Meme"} fill className="object-cover" />
                          ) : (
                            <div className="flex items-center justify-center h-full text-xs text-gray-400">No Image</div>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-gray-900 truncate">{m.title || m.top_text || "Untitled Meme"}</h4>
                        <div className="flex items-center justify-between text-[11px] text-gray-500">
                          <span className="flex items-center gap-1 text-blue-600 font-semibold"><ThumbsUp className="w-3 h-3" /> {m.upvotes_count || 0}</span>
                          <span>{new Date(m.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: TEMPLATES */}
            {activeTab === "Templates" && (
              <div>
                {publicTemplates.length === 0 ? (
                  <div className="virlio-card p-8 sm:p-12 text-center bg-white border border-gray-200 rounded-3xl space-y-3">
                    <div className="relative w-36 h-36 mx-auto">
                      <Image src="/images/empty_state/no_templates.png" alt="No Templates Illustration" fill className="object-contain" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No templates uploaded yet</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Community meme templates contributed by @{profile.username} will be featured here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {publicTemplates.map((t) => (
                      <ProfileTemplateCard key={t.id} t={t} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: BRANDS */}
            {activeTab === "Brands" && (
              <div>
                {managedBrands.length === 0 ? (
                  <div className="virlio-card p-8 sm:p-12 text-center bg-white border border-gray-200 rounded-3xl space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">No public brands managed</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Brands registered or managed by @{profile.username} will be displayed here.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {managedBrands.map((b) => (
                      <div key={b.id} className="virlio-card p-5 bg-white border border-gray-200 rounded-3xl space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                            {b.logo_url ? <Image src={b.logo_url} alt={b.name} fill className="object-cover" /> : <Building2 className="w-6 h-6 text-blue-600" />}
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-gray-900">{b.name}</h4>
                            <p className="text-xs text-gray-500">{b.industry || "Brand"}</p>
                          </div>
                        </div>
                        <Link href={`/brands/${b.slug}`} className="block text-center text-xs font-bold text-blue-600 hover:underline">View Brand Page</Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: ACTIVITY */}
            {activeTab === "Activity" && (
              <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Public Activity Timeline</h3>
                <div className="space-y-4">
                  {activityTimeline.map((act) => (
                    <div key={act.id} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{act.label || act.title || act.type}</p>
                        {act.description && <p className="text-xs text-gray-500 mt-0.5">{act.description}</p>}
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(act.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 5: ACHIEVEMENTS & BADGES */}
            {activeTab === "Achievements" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-gray-900">Unlocked Badges ({userBadges.length})</h3>
                  <Link href="/achievements" className="text-xs font-bold text-blue-600 hover:underline">View All Achievements Catalog</Link>
                </div>

                {userBadges.length === 0 ? (
                  <div className="virlio-card p-6 bg-white border border-gray-200 text-center text-xs text-gray-500">
                    No achievement badges unlocked yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {userBadges.map((ub) => {
                      const badgeObj = ub.badge;
                      if (!badgeObj) return null;
                      const iconUrl = badgeObj.icon_url || "/images/badges/badge_Early_adopter.png";

                      return (
                        <div key={ub.id} className="virlio-card p-5 text-center flex flex-col items-center justify-between bg-white border border-gray-200 rounded-3xl">
                          <div className="relative w-20 h-20 mb-3">
                            <Image src={iconUrl} alt={badgeObj.name} fill sizes="80px" className="object-contain drop-shadow-xs" />
                          </div>
                          <div>
                            <p className="text-sm font-extrabold text-gray-900 leading-snug">{badgeObj.name}</p>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase mt-1 inline-block">
                              {badgeObj.category || "Special"}
                            </span>
                            <p className="text-[11px] text-gray-500 mt-2 font-medium">
                              Unlocked on {formatUnlockedAt(ub.unlocked_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* Modals */}
      <ReportProfileModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        targetUserId={profile.id}
        targetUsername={rawUsername}
      />

      <ShareProfileModal
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        username={rawUsername}
        displayName={displayName}
      />
    </div>
  );
}

export default function UserPublicProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <UserPublicProfileContent />
    </Suspense>
  );
}
