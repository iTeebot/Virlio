"use client";

import React, { useMemo, useState } from "react";
import { Calendar, Flame, Zap, CheckCircle2 } from "lucide-react";

interface ActivityContributionGridProps {
  currentStreak: number;
  longestStreak: number;
  createdAt?: string | Date | null;
  activityTimeline?: Array<{ id?: string; type?: string; label?: string; title?: string; created_at: string | Date }>;
  contributionDates?: Array<{ created_at: string | Date; type?: string }>;
  contributionCalendar?: Record<string, { date: string; count: number; events?: any[] }>;
}

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ActivityContributionGrid({
  currentStreak = 0,
  longestStreak = 0,
  createdAt,
  activityTimeline = [],
  contributionDates = [],
  contributionCalendar = {},
}: ActivityContributionGridProps) {
  const [hoveredTile, setHoveredTile] = useState<{ dateStr: string; count: number } | null>(null);

  // Generate 52 weeks (364 days) calendar dates ending today
  const calendarData = useMemo(() => {
    const today = new Date();
    const result: Array<{ dateStr: string; formattedDate: string; count: number; dayOfWeek: number }> = [];

    // Map activity counts by YYYY-MM-DD
    const activityMap: Record<string, number> = {};

    // 0. Process contributionCalendar if available
    if (contributionCalendar && Object.keys(contributionCalendar).length > 0) {
      Object.entries(contributionCalendar).forEach(([dateKey, dayObj]) => {
        activityMap[dateKey] = (activityMap[dateKey] || 0) + (dayObj.count || 0);
      });
    }

    // 1. Process activityTimeline
    activityTimeline.forEach((act) => {
      if (!act?.created_at) return;
      const d = new Date(act.created_at);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      activityMap[key] = (activityMap[key] || 0) + 1;
    });

    // 2. Process contributionDates
    contributionDates.forEach((cd) => {
      if (!cd?.created_at) return;
      const d = new Date(cd.created_at);
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().split("T")[0];
      activityMap[key] = (activityMap[key] || 0) + 1;
    });

    // 3. Seed account creation date
    if (createdAt) {
      const cDate = new Date(createdAt);
      if (!isNaN(cDate.getTime())) {
        const cKey = cDate.toISOString().split("T")[0];
        activityMap[cKey] = (activityMap[cKey] || 0) + 1;
      }
    }

    // Generate past 364 days
    for (let i = 363; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const formattedDate = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      const count = activityMap[dateStr] || 0;
      result.push({ dateStr, formattedDate, count, dayOfWeek: d.getDay() });
    }

    return result;
  }, [createdAt, activityTimeline, contributionDates]);

  // Group days into 52 weeks
  const weeks = useMemo(() => {
    const w: Array<Array<{ dateStr: string; formattedDate: string; count: number; dayOfWeek: number }>> = [];
    let currentWeek: Array<{ dateStr: string; formattedDate: string; count: number; dayOfWeek: number }> = [];

    calendarData.forEach((day, idx) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || idx === calendarData.length - 1) {
        w.push(currentWeek);
        currentWeek = [];
      }
    });

    return w;
  }, [calendarData]);

  // Generate month headers positioned across columns
  const monthLabels = useMemo(() => {
    const labels: Array<{ monthName: string; weekIndex: number }> = [];
    let lastMonth = -1;

    weeks.forEach((week, wIdx) => {
      if (week.length > 0) {
        const d = new Date(week[0].dateStr);
        const m = d.getMonth();
        if (m !== lastMonth) {
          labels.push({ monthName: MONTH_NAMES[m], weekIndex: wIdx });
          lastMonth = m;
        }
      }
    });

    return labels;
  }, [weeks]);

  const totalActiveDays = calendarData.filter((d) => d.count > 0).length;
  const totalContributions = calendarData.reduce((acc, d) => acc + d.count, 0);

  return (
    <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-bold text-gray-900">Activity & Contribution Calendar</h3>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real contribution intensity map across meme generation, template uploads, and community activity.
          </p>
        </div>

        {/* Quick Streak & Contribution Metrics */}
        <div className="flex items-center gap-3 text-xs font-semibold shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 border border-orange-200">
            <Flame className="w-4 h-4 text-orange-500" />
            <span>{currentStreak}d Current Streak</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>{longestStreak}d Highest Streak</span>
          </div>
        </div>
      </div>

      {/* GitHub Style Interactive Contribution Grid Container */}
      <div className="overflow-x-auto no-scrollbar pt-2 pb-1 relative">
        <div className="min-w-[680px] space-y-2">
          {/* Month Headers */}
          <div className="flex text-[10px] font-bold text-gray-400 pl-0.5 mb-1 relative h-4">
            {monthLabels.map((lbl, i) => (
              <span
                key={i}
                className="absolute uppercase tracking-wider"
                style={{ left: `${(lbl.weekIndex / weeks.length) * 100}%` }}
              >
                {lbl.monthName}
              </span>
            ))}
          </div>

          {/* Calendar Heatmap Grid */}
          <div className="flex gap-1.5 pt-1">
            {weeks.map((week, wIdx) => (
              <div key={wIdx} className="flex flex-col gap-1.5">
                {week.map((day, dIdx) => {
                  let bgColor = "bg-gray-100 border-gray-200/60";
                  if (day.count === 1) bgColor = "bg-blue-100 border-blue-200 text-blue-900";
                  else if (day.count === 2) bgColor = "bg-blue-300 border-blue-400 text-blue-950";
                  else if (day.count >= 3) bgColor = "bg-blue-600 border-blue-700 text-white";

                  return (
                    <div
                      key={`${wIdx}-${dIdx}`}
                      onMouseEnter={() => setHoveredTile({ dateStr: day.formattedDate, count: day.count })}
                      onMouseLeave={() => setHoveredTile(null)}
                      className={`w-3.5 h-3.5 rounded-xs border transition-all cursor-pointer hover:scale-125 hover:z-10 ${bgColor}`}
                      title={`${day.formattedDate}: ${day.count} ${day.count === 1 ? "contribution" : "contributions"}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>

          {/* Legend & Dynamic Tooltip */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-3">
            <span className="font-semibold text-gray-700">
              {hoveredTile ? (
                <span className="text-blue-600 font-bold">
                  {hoveredTile.dateStr}: {hoveredTile.count} {hoveredTile.count === 1 ? "contribution" : "contributions"}
                </span>
              ) : (
                <span>{totalContributions} contributions in the last year</span>
              )}
            </span>

            <div className="flex items-center gap-2">
              <span>Less</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-xs bg-gray-100 border border-gray-200" title="0 contributions" />
                <div className="w-3 h-3 rounded-xs bg-blue-100 border border-blue-200" title="1 contribution" />
                <div className="w-3 h-3 rounded-xs bg-blue-300 border border-blue-400" title="2 contributions" />
                <div className="w-3 h-3 rounded-xs bg-blue-600 border border-blue-700" title="3+ contributions" />
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span><strong>{totalActiveDays}</strong> Active Days Recorded</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Flame className="w-4 h-4 text-orange-500 shrink-0" />
          <span><strong>{currentStreak}</strong> Consecutive Active Days</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Zap className="w-4 h-4 text-amber-500 shrink-0" />
          <span><strong>{longestStreak}</strong> All-Time Record Streak</span>
        </div>
      </div>
    </div>
  );
}
