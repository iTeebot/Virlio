"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import {
  Trophy,
  Award,
  ThumbsUp,
  Download,
  CheckCircle2,
  Flame,
  UserCheck,
  Building2,
  ArrowRight,
  ShieldCheck,
  User,
  Loader2,
} from "lucide-react";

interface RealUser {
  id: string;
  name?: string | null;
  username?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
  trust_score?: number | null;
  contributor_score?: number | null;
  created_at?: string | Date | null;
  userBadges?: any[];
}

import { useTemplateStore } from "@/providers/template-provider";
import { useTemplateVote } from "@/hooks/useTemplateVote";

function LeaderboardTemplateRow({ t, idx }: { t: any; idx: number }) {
  const { upvotesCount } = useTemplateVote(t.id, {
    upvotes_count: t.upvotes_count,
    currentUserVote: t.currentUserVote,
  });

  return (
    <tr className="hover:bg-gray-50/80 transition-colors">
      <td className="px-6 py-4 font-bold text-gray-900">#{idx + 1}</td>
      <td className="px-6 py-4 font-bold text-gray-900">
        <Link href={`/templates/${t.slug || t.id}`} className="hover:text-blue-600 transition-colors">
          {t.title}
        </Link>
      </td>
      <td className="px-6 py-4">
        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
          {t.category}
        </span>
      </td>
      <td className="px-6 py-4 text-right font-bold text-blue-600">{upvotesCount}</td>
    </tr>
  );
}

export default function LeaderboardsPage() {
  const params = useParams();
  const categoryParam = typeof params.category === "string" ? params.category : "top-contributers";
  const timeframeParam = typeof params.timeframe === "string" ? params.timeframe : "all-time";

  const activeTab = categoryParam === "viral-templates" ? "templates" : categoryParam === "verified-brands" ? "brands" : "contributors";
  const timeframe = timeframeParam === "monthly" ? "monthly" : timeframeParam === "weekly" ? "weekly" : "allTime";

  const [users, setUsers] = useState<RealUser[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { syncTemplates } = useTemplateStore();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [usersRes, tplRes, brandRes] = await Promise.all([
          fetch(`/api/v1/users?timeframe=${timeframe}`),
          fetch(`/api/v1/templates?timeframe=${timeframe}`),
          fetch(`/api/v1/brands?timeframe=${timeframe}`),
        ]);

        if (usersRes.ok) {
          const uJson = await usersRes.json();
          setUsers(uJson.data || []);
        }
        if (tplRes.ok) {
          const tJson = await tplRes.json();
          const tData = tJson.data || [];
          setTemplates(tData);
          syncTemplates(tData);
        }
        if (brandRes.ok) {
          const bJson = await brandRes.json();
          setBrands(bJson.data || []);
        }
      } catch (err) {
        // Fallback
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [timeframe]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Title Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-blue-700 mb-4">
              <Trophy className="w-3.5 h-3.5 text-blue-600" />
              <span>Real-Time Virality & Contribution Rankings</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
              Public Virlio Leaderboards
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Discover top-scoring contributors, most downloaded meme templates, and fastest growing verified brands.
            </p>
          </div>

          {/* Controls Bar: Tabs & Timeframe */}
          <div className="virlio-surface p-4 mb-8 border border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Category Tabs */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Link
                href={`/leaderboards/top-contributers/${timeframeParam}`}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === "contributors"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Top Contributors ({users.length})</span>
              </Link>

              <Link
                href={`/leaderboards/viral-templates/${timeframeParam}`}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === "templates"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Flame className="w-4 h-4" />
                <span>Viral Templates ({templates.length})</span>
              </Link>

              <Link
                href={`/leaderboards/verified-brands/${timeframeParam}`}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors ${
                  activeTab === "brands"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Verified Brands ({brands.length})</span>
              </Link>
            </div>

            {/* Timeframe selector */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-1 text-xs font-medium">
              <Link
                href={`/leaderboards/${categoryParam}/weekly`}
                className={`px-3 py-1 rounded-md transition-colors ${timeframeParam === "weekly" ? "bg-gray-100 font-bold text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Weekly
              </Link>
              <Link
                href={`/leaderboards/${categoryParam}/monthly`}
                className={`px-3 py-1 rounded-md transition-colors ${timeframeParam === "monthly" ? "bg-gray-100 font-bold text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
              >
                Monthly
              </Link>
              <Link
                href={`/leaderboards/${categoryParam}/all-time`}
                className={`px-3 py-1 rounded-md transition-colors ${timeframeParam === "all-time" ? "bg-gray-100 font-bold text-gray-900" : "text-gray-600 hover:bg-gray-50"}`}
              >
                All-Time
              </Link>
            </div>
          </div>

          {/* Table Container */}
          <div className="virlio-card overflow-hidden bg-white border border-gray-200 rounded-3xl">
            {loading ? (
              <div className="py-16 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading live database rankings...</span>
              </div>
            ) : activeTab === "contributors" ? (
              users.length === 0 ? (
                <div className="p-8 text-center">
                  <ErrorPageLayout
                    imageSrc="/images/errors/nothing_here_yet.png"
                    imageAlt="No Contributors Illustration"
                    title="No Ranked Contributors Yet"
                    description="Be the first contributor to upload meme templates and climb the community leaderboard!"
                    statusBadgeText="0 Ranked Contributors"
                    primaryButtonText="Create Account"
                    primaryButtonHref="/register"
                    primaryButtonIconName="explore"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Contributor</th>
                        <th className="px-6 py-4">Badges Unlocked</th>
                        <th className="px-6 py-4">Trust Score</th>
                        <th className="px-6 py-4 text-right">Contributor Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {users.map((u, idx) => {
                        const rank = idx + 1;
                        const uName = u.name || (u.username ? `@${u.username}` : "Creator");
                        const handle = u.username ? `@${u.username}` : u.email || "";

                        return (
                          <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="px-6 py-4 font-bold text-gray-900">
                              {rank === 1 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">#1</span>}
                              {rank === 2 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-200 text-slate-800 font-bold text-xs">#2</span>}
                              {rank === 3 && <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-800/10 text-amber-900 font-bold text-xs">#3</span>}
                              {rank > 3 && <span className="text-gray-500 pl-2">#{rank}</span>}
                            </td>
                            <td className="px-6 py-4">
                              <Link href={u.username ? `/profiles/${u.username}` : "#"} className="flex items-center gap-3 group">
                                <div className="relative w-9 h-9 rounded-full overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                  {u.image ? (
                                    <Image src={u.image} alt={uName} fill unoptimized className="object-cover" />
                                  ) : (
                                    <User className="w-4 h-4 text-blue-600" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{uName}</p>
                                  <p className="text-xs text-gray-500">{handle}</p>
                                </div>
                              </Link>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                                <Award className="w-3.5 h-3.5" />
                                {u.userBadges?.length || 0} Badges
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1 text-emerald-600 font-bold">
                                <ShieldCheck className="w-4 h-4" />
                                <span>{u.trust_score ?? 100} / 100</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-right font-extrabold text-blue-600">
                              {u.contributor_score || 0} pts
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )
            ) : activeTab === "templates" ? (
              templates.length === 0 ? (
                <div className="p-8 text-center">
                  <ErrorPageLayout
                    imageSrc="/images/errors/nothing_here_yet.png"
                    imageAlt="No Templates Illustration"
                    title="No Viral Templates Yet"
                    description="Upload meme templates to get featured on the viral templates leaderboard!"
                    statusBadgeText="0 Templates"
                    primaryButtonText="Upload Template"
                    primaryButtonHref="/dashboard/templates/upload"
                    primaryButtonIconName="explore"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Template Title</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4 text-right">Upvotes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {templates.map((t, idx) => (
                        <LeaderboardTemplateRow key={t.id} t={t} idx={idx} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              brands.length === 0 ? (
                <div className="p-8 text-center">
                  <ErrorPageLayout
                    imageSrc="/images/errors/nothing_here_yet.png"
                    imageAlt="No Brands Illustration"
                    title="No Verified Brands Yet"
                    description="Create a workspace brand to get listed on the official brand leaderboard!"
                    statusBadgeText="0 Verified Brands"
                    primaryButtonText="Create Brand Workspace"
                    primaryButtonHref="/dashboard/brands/new"
                    primaryButtonIconName="explore"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs font-bold uppercase tracking-wider text-gray-700 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4">Rank</th>
                        <th className="px-6 py-4">Brand Name</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {brands.map((b, idx) => (
                        <tr key={b.id} className="hover:bg-gray-50/80 transition-colors">
                          <td className="px-6 py-4 font-bold text-gray-900">#{idx + 1}</td>
                          <td className="px-6 py-4 font-bold text-gray-900">{b.name}</td>
                          <td className="px-6 py-4 text-right font-semibold text-emerald-600 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Active Brand</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
