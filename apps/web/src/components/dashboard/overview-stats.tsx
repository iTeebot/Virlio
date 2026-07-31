import React from "react";
import { Sparkles, Building2, ThumbsUp, Zap } from "lucide-react";

interface OverviewStatsProps {
  stats: {
    totalMemes: number;
    totalBrands: number;
    totalUpvotes: number;
    currentStreak: number;
    level: number;
    xpPoints: number;
  };
}

export function OverviewStats({ stats }: OverviewStatsProps) {
  const statCards = [
    {
      label: "Memes Generated",
      value: stats.totalMemes.toLocaleString(),
      subtext: "AI generated content",
      icon: Sparkles,
      iconBg: "bg-blue-50 text-blue-600 border-blue-100",
    },
    {
      label: "Active Brands",
      value: stats.totalBrands.toLocaleString(),
      subtext: "Brand workspaces",
      icon: Building2,
      iconBg: "bg-purple-50 text-purple-600 border-purple-100",
    },
    {
      label: "Community Upvotes",
      value: stats.totalUpvotes.toLocaleString(),
      subtext: "Total votes received",
      icon: ThumbsUp,
      iconBg: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
    {
      label: "Daily Activity Streak",
      value: `${stats.currentStreak} Days`,
      subtext: `Level ${stats.level} (${stats.xpPoints} XP)`,
      icon: Zap,
      iconBg: "bg-amber-50 text-amber-600 border-amber-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="virlio-card p-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:border-gray-300 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                {card.value}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-1 font-medium">
              {card.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
