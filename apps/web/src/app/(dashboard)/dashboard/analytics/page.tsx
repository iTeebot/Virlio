"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  BarChart3,
  Award,
  Zap,
  Flame,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
  Users,
  ArrowUpRight,
  Clock,
  Download,
  Calendar,
  ChevronRight,
  Loader2,
  Activity,
  TrendingUp,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────
// CONTRIBUTION CALENDAR COMPONENT (GitHub-style Heatmap)
// ─────────────────────────────────────────────────────────────
function ContributionCalendar({
  calendar,
  activeDays,
  totalContributions,
  currentStreak,
  longestStreak,
}: {
  calendar: Record<string, { date: string; count: number; events: any[] }>;
  activeDays: number;
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
}) {
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate 52 weeks of calendar data ending today
  const weeks = useMemo(() => {
    const result: { date: Date; key: string; count: number; events: any[] }[][] = [];
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 364); // ~52 weeks back
    // Align to Sunday
    startDate.setDate(startDate.getDate() - startDate.getDay());

    let currentWeek: { date: Date; key: string; count: number; events: any[] }[] = [];

    const cursor = new Date(startDate);
    while (cursor <= today) {
      const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      const dayData = calendar[key] || { date: key, count: 0, events: [] };

      currentWeek.push({
        date: new Date(cursor),
        key,
        count: dayData.count,
        events: dayData.events,
      });

      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    if (currentWeek.length > 0) {
      result.push(currentWeek);
    }

    return result;
  }, [calendar]);

  function getColor(count: number): string {
    if (count === 0) return "bg-gray-100 border-gray-200";
    if (count === 1) return "bg-emerald-200 border-emerald-300";
    if (count <= 3) return "bg-emerald-400 border-emerald-500";
    if (count <= 5) return "bg-emerald-500 border-emerald-600";
    return "bg-emerald-600 border-emerald-700";
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const months = useMemo(() => {
    const labels: { label: string; col: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, weekIdx) => {
      const firstDay = week[0];
      if (firstDay && firstDay.date.getMonth() !== lastMonth) {
        lastMonth = firstDay.date.getMonth();
        labels.push({
          label: firstDay.date.toLocaleDateString("en-US", { month: "short" }),
          col: weekIdx,
        });
      }
    });
    return labels;
  }, [weeks]);

  const hoveredData = hoveredDay ? calendar[hoveredDay] : null;

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Contribution Calendar
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Your activity history across the Virlio platform.
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="font-bold text-gray-900">{totalContributions}</span>
            <span className="text-gray-500">contributions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="font-bold text-gray-900">{currentStreak}</span>
            <span className="text-gray-500">day streak</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
            <span className="font-bold text-gray-900">{activeDays}</span>
            <span className="text-gray-500">active days</span>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[700px]">
          {/* Month Labels */}
          <div className="flex gap-0 ml-8 mb-1">
            {months.map((m, i) => (
              <div
                key={i}
                className="text-[10px] text-gray-400 font-medium"
                style={{
                  position: "relative",
                  left: `${m.col * 14}px`,
                  width: "0",
                  whiteSpace: "nowrap",
                }}
              >
                {m.label}
              </div>
            ))}
          </div>

          <div className="flex gap-0.5">
            {/* Day Labels */}
            <div className="flex flex-col gap-0.5 mr-1 text-[9px] text-gray-400 font-medium pt-0">
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Mon</span>
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Wed</span>
              <span className="h-[12px] leading-[12px]"></span>
              <span className="h-[12px] leading-[12px]">Fri</span>
              <span className="h-[12px] leading-[12px]"></span>
            </div>

            {/* Weeks */}
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.5">
                {week.map((day) => (
                  <div
                    key={day.key}
                    className={`w-[12px] h-[12px] rounded-[3px] border cursor-pointer transition-all hover:ring-1 hover:ring-gray-400 ${getColor(day.count)}`}
                    onMouseEnter={(e) => {
                      setHoveredDay(day.key);
                      const rect = e.currentTarget.getBoundingClientRect();
                      setTooltipPos({ x: rect.left, y: rect.top });
                    }}
                    onMouseLeave={() => setHoveredDay(null)}
                    aria-label={`${formatDate(day.date)}: ${day.count} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-[10px] text-gray-400 font-medium">Less</span>
            <div className="w-[12px] h-[12px] rounded-[3px] bg-gray-100 border border-gray-200" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-200 border border-emerald-300" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-400 border border-emerald-500" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-500 border border-emerald-600" />
            <div className="w-[12px] h-[12px] rounded-[3px] bg-emerald-600 border border-emerald-700" />
            <span className="text-[10px] text-gray-400 font-medium">More</span>
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div className="mt-2 p-3 bg-gray-900 text-white rounded-xl text-xs max-w-xs shadow-lg">
          <p className="font-bold">{new Date(hoveredDay + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}</p>
          {hoveredData && hoveredData.count > 0 ? (
            <>
              <p className="text-emerald-400 font-bold mt-1">{hoveredData.count} contribution{hoveredData.count > 1 ? "s" : ""}</p>
              <ul className="mt-1 space-y-0.5 text-gray-300">
                {hoveredData.events.slice(0, 5).map((ev: any, i: number) => (
                  <li key={i}>• {ev.label}</li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-gray-400 mt-1">No contributions</p>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN ANALYTICS PAGE
// ─────────────────────────────────────────────────────────────
export default function UserAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const res = await fetch("/api/v1/users/analytics");
        if (res.ok) {
          const json = await res.json();
          setData(json.data);
        } else {
          setError("Failed to load user analytics.");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading analytics.");
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-gray-500 font-medium flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span>Computing real platform analytics...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-white border border-gray-200 rounded-3xl max-w-md mx-auto my-12 space-y-4 shadow-xs">
        <p className="text-sm font-bold text-red-600">{error || "Analytics unavailable."}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const {
    user,
    xp = 0,
    level = 1,
    currentStreak = 0,
    longestStreak = 0,
    trustScore = 100,
    totalTemplates = 0,
    approvedTemplates = 0,
    pendingTemplates = 0,
    templateViews = 0,
    templateUpvotes = 0,
    templateApprovalRate = 0,
    mostPopularTemplate = null,
    totalMemes = 0,
    publicMemes = 0,
    privateMemes = 0,
    memeUpvotes = 0,
    mostPopularMeme = null,
    brandsOwned = 0,
    followerCount = 0,
    followingCount = 0,
    userBrands = [],
    contributionCalendar = {},
    activeDays = 0,
    totalContributions = 0,
    timeline = [],
    xpBreakdown = [],
  } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Header & Filter Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              User Account Analytics
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-blue-600" />
            Platform Performance & Analytics
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Overall contribution stats, XP progression, streaks, and content reach for <strong className="text-gray-900">@{user?.username || user?.name || "creator"}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <a
            href={`data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`}
            download={`virlio-user-analytics-${user?.id || "user"}.json`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            Export Data
          </a>
        </div>
      </div>

      {/* SECTION 1: OVERVIEW KPIs GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* KPI 1: Level & XP */}
        <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            XP Level <Award className="w-4 h-4 text-purple-600" />
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-gray-900">Lvl {level}</span>
            <span className="text-xs font-bold text-purple-600">{xp} XP</span>
          </div>
          <span className="text-[10px] text-gray-500 block truncate">Platform Rank Progress</span>
        </div>

        {/* KPI 2: Active Streak */}
        <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            Active Streak <Flame className="w-4 h-4 text-amber-500" />
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-gray-900">{currentStreak} Days</span>
          </div>
          <span className="text-[10px] text-gray-500 block truncate">Longest: {longestStreak} Days</span>
        </div>

        {/* KPI 3: Trust Score */}
        <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            Trust Score <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-emerald-600">{trustScore}</span>
            <span className="text-xs font-bold text-gray-400">/100</span>
          </div>
          <span className="text-[10px] text-gray-500 block truncate">Verified Platform Creator</span>
        </div>

        {/* KPI 4: Templates Uploaded */}
        <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            Templates <Layers className="w-4 h-4 text-blue-600" />
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-gray-900">{totalTemplates}</span>
            <span className="text-xs font-bold text-emerald-600">{approvedTemplates} Appr</span>
          </div>
          <span className="text-[10px] text-gray-500 block truncate">{templateViews} Total Views</span>
        </div>

        {/* KPI 5: Memes Generated */}
        <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            Memes <Sparkles className="w-4 h-4 text-amber-500" />
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-gray-900">{totalMemes}</span>
            <span className="text-xs font-bold text-blue-600">{publicMemes} Pub</span>
          </div>
          <span className="text-[10px] text-gray-500 block truncate">{memeUpvotes} Total Upvotes</span>
        </div>

        {/* KPI 6: Community Followers */}
        <div className="p-4 bg-white border border-gray-200 rounded-2xl space-y-1 shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 flex items-center justify-between">
            Community <Users className="w-4 h-4 text-indigo-600" />
          </span>
          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-2xl font-black text-gray-900">{followerCount}</span>
            <span className="text-xs font-bold text-gray-500">Followers</span>
          </div>
          <span className="text-[10px] text-gray-500 block truncate">{followingCount} Following</span>
        </div>
      </div>

      {/* SECTION 2: CONTRIBUTION CALENDAR */}
      <ContributionCalendar
        calendar={contributionCalendar}
        activeDays={activeDays}
        totalContributions={totalContributions}
        currentStreak={currentStreak}
        longestStreak={longestStreak}
      />

      {/* SECTION 3: XP BREAKDOWN */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              XP Contribution Sources
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Calculated breakdown of points earned from platform activities.</p>
          </div>
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-3 py-1 rounded-xl border border-blue-100">
            Total {xp} XP
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {xpBreakdown.map((src: any, idx: number) => {
            const pct = src.percentage || (xp > 0 ? Math.round((src.points / xp) * 100) : 0);
            return (
              <div key={idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">{src.name}</span>
                  <span className="text-xs font-black text-gray-900">+{src.points} XP</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className={`h-full ${src.color} transition-all duration-500`} style={{ width: `${Math.max(5, pct)}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-semibold">
                  <span>{src.count} Total Items</span>
                  <span>{pct}% Contribution</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: CONTENT PERFORMANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates Performance */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Template Performance
            </h3>
            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-100">
              {templateApprovalRate}% Approval Rate
            </span>
          </div>

          {totalTemplates === 0 ? (
            <EmptyState
              icon={Layers}
              title="No templates uploaded yet"
              description="Upload custom meme templates to earn contribution XP and community upvotes."
              actionLabel="Upload Template"
              actionHref="/dashboard/templates"
              iconColor="text-purple-600"
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-900 block">{templateViews}</span>
                  <span className="text-[10px] text-gray-500 font-medium">Total Views</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-emerald-700 block">{templateUpvotes}</span>
                  <span className="text-[10px] text-gray-500 font-medium">Upvotes</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-amber-700 block">{pendingTemplates}</span>
                  <span className="text-[10px] text-gray-500 font-medium">Pending Mod</span>
                </div>
              </div>

              {mostPopularTemplate && (
                <div className="p-4 bg-purple-50/50 border border-purple-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Most Popular Template</span>
                    <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{mostPopularTemplate.name}</h4>
                  </div>
                  <span className="text-xs font-black text-purple-700 bg-white px-2.5 py-1 rounded-lg border border-purple-200 shrink-0">
                    {mostPopularTemplate.upvotes_count || 0} Upvotes
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Memes Performance */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Meme Content Reach
            </h3>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100">
              {totalMemes} Rendered
            </span>
          </div>

          {totalMemes === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="No memes generated yet"
              description="Use Virlio AI Meme Studio to render brand memes and build your public creator portfolio."
              actionLabel="Generate First Meme"
              actionHref="/dashboard/generator"
              iconColor="text-amber-500"
            />
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-blue-600 block">{publicMemes}</span>
                  <span className="text-[10px] text-gray-500 font-medium">Public Memes</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-gray-700 block">{privateMemes}</span>
                  <span className="text-[10px] text-gray-500 font-medium">Private Drafts</span>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-xs font-bold text-emerald-600 block">{memeUpvotes}</span>
                  <span className="text-[10px] text-gray-500 font-medium">Meme Upvotes</span>
                </div>
              </div>

              {mostPopularMeme && (
                <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">Top Performing Meme</span>
                    <h4 className="text-xs font-bold text-gray-900 truncate mt-0.5">{mostPopularMeme.title || mostPopularMeme.caption_text || "Untitled Meme"}</h4>
                  </div>
                  <span className="text-xs font-black text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                    {mostPopularMeme.likes_count || mostPopularMeme.upvotes_count || 0} Upvotes
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: BRAND PORTFOLIO */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Brand Portfolio Summary
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">Quick overview of brands owned and managed by your account.</p>
          </div>
          <Link
            href="/dashboard/brands"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All Brands <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {brandsOwned === 0 ? (
          <EmptyState
            icon={Building2}
            title="No brand workspaces owned"
            description="Create your first brand identity to configure AI rules, domain verification, and team collaboration."
            actionLabel="Create New Brand"
            actionHref="/dashboard/brands/new"
            iconColor="text-blue-600"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userBrands.map((b: any) => {
              const isVerified = (b.verification_status || "").toLowerCase() === "verified";
              return (
                <div key={b.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        {b.name}
                        {isVerified && <ShieldCheck className="w-4 h-4 text-emerald-600" />}
                      </h4>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase border ${
                        isVerified ? "bg-emerald-100 text-emerald-800 border-emerald-200" : "bg-amber-100 text-amber-800 border-amber-200"
                      }`}>
                        {b.verification_status || "Pending"}
                      </span>
                    </div>
                    <span className="text-xs text-blue-600 font-mono font-semibold block">@{b.slug}</span>
                  </div>

                  <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-[11px] text-gray-500 font-medium">Score: <strong>{b.ai_confidence_score || 0} / 100 PTS</strong></span>
                    <Link
                      href={`/dashboard/brands/${b.id}/overview`}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      Workspace <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 6: ACTIVITY TIMELINE */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Activity Timeline
          </h3>
          <span className="text-xs font-bold text-gray-500">{timeline.length} events</span>
        </div>

        {timeline.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No activity recorded yet"
            description="Your platform activities, brand creations, and meme generations will appear chronologically here."
            iconColor="text-blue-600"
          />
        ) : (
          <div className="space-y-3">
            {timeline.map((act: any, idx: number) => (
              <div key={act.id || idx} className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${act.color || "bg-blue-600"} shrink-0`} />
                  <span className="font-bold text-gray-900">{act.label || act.type || "Activity"}</span>
                </div>
                <span className="text-gray-400 font-mono text-[10px] shrink-0">
                  {new Date(act.created_at || Date.now()).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
