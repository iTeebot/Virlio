"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import {
  Calendar,
  Award,
  ShieldCheck,
  User,
  ArrowLeft,
  Sparkles,
  Layers,
  AlertCircle,
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

interface UserProfileData {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  trust_score?: number | null;
  contributor_score?: number | null;
  account_status?: string | null;
  created_at?: string | Date | null;
  badges?: UserBadgeItem[];
}

function formatMemberSince(dateInput: string | Date | null | undefined): { exact: string; age: string } {
  if (!dateInput) return { exact: "Recently", age: "" };
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return { exact: "Recently", age: "" };

  const exact =
    d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const now = new Date();
  const diffMs = Math.max(0, now.getTime() - d.getTime());
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  let age = "";
  if (diffMins < 60) {
    age = `${diffMins} ${diffMins === 1 ? "minute" : "minutes"} old`;
  } else if (diffHours < 24) {
    age = `${diffHours} ${diffHours === 1 ? "hour" : "hours"} old`;
  } else {
    age = `${diffDays} ${diffDays === 1 ? "day" : "days"} old`;
  }

  return { exact, age };
}

function formatUnlockedAt(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return "Recently";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Recently";

  return (
    d.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }) +
    " at " +
    d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );
}

export default function UserPublicProfilePage() {
  const params = useParams();
  const rawUsername = params?.username as string;

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!rawUsername) return;

    async function fetchProfile() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/v1/users/check-username?username=${encodeURIComponent(rawUsername)}`);
        const json = await res.json();

        if (json.success && json.data && !json.data.available && json.data.user) {
          setProfile(json.data.user);
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

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Back to Explore */}
          <div className="mb-8">
            <Link
              href="/explore"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore</span>
            </Link>
          </div>

          {/* Profile Header Hero Card */}
          <div className="virlio-surface p-8 sm:p-10 border border-gray-200 mb-12">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                {/* User Avatar */}
                <div className="relative w-20 h-20 rounded-full overflow-hidden bg-blue-50 border-4 border-white shadow-md flex items-center justify-center shrink-0">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt={displayName}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-blue-600" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                      {displayName}
                    </h1>

                    {/* Unverified Empty State Badge with Tooltip */}
                    <div
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-semibold text-gray-500 cursor-help"
                      title="Account not yet verified"
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                      <span>Not yet verified</span>
                    </div>

                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      {role}
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-gray-500 mt-1">
                    {usernameHandle}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>Member since {dateInfo.exact}</span>
                      {dateInfo.age && (
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 ml-1">
                          ({dateInfo.age})
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="grid grid-cols-2 gap-4 text-center bg-white p-4 rounded-2xl border border-gray-200 w-full md:w-auto shrink-0">
                <div className="px-3">
                  <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                    <ShieldCheck className="w-4 h-4" />
                    <span className="text-lg font-extrabold">{profile.trust_score ?? 100}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Trust Score</p>
                </div>
                <div className="border-l border-gray-100 px-3">
                  <div className="flex items-center justify-center gap-1 text-purple-600 mb-0.5">
                    <Award className="w-4 h-4" />
                    <span className="text-lg font-extrabold">{profile.contributor_score || 0}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 font-semibold uppercase">Contributor Score</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earned Badges Showcase */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">Earned Achievements & Badges</h2>
                <p className="text-xs text-gray-600 mt-0.5">Official achievement badges unlocked by @{profile.username || "user"}</p>
              </div>
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
                  const unlockedText = formatUnlockedAt(ub.unlocked_at);

                  return (
                    <div key={ub.id} className="virlio-card p-5 text-center flex flex-col items-center justify-between bg-white border border-gray-200 rounded-3xl shadow-2xs">
                      <div className="relative w-20 h-20 mb-3">
                        <Image
                          src={iconUrl}
                          alt={badgeObj.name}
                          fill
                          sizes="80px"
                          className="object-contain drop-shadow-xs"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-extrabold text-gray-900 leading-snug">{badgeObj.name}</p>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase mt-1 inline-block">
                          {badgeObj.category || "Special"}
                        </span>
                        <p className="text-[11px] text-gray-500 mt-2 font-medium">
                          Unlocked on {unlockedText}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* User Memes & Content Section */}
          <div className="virlio-surface p-8 border border-gray-200 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">
              Public Content by {displayName}
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Memes and templates created by {displayName} will be displayed here once published.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
