import React from "react";
import { Activity, Sparkles, Building2, Award, Zap, UserPlus } from "lucide-react";

interface ActivityItem {
  id: string;
  activity_type: string;
  metadata?: any;
  created_at?: Date | string | null;
}

interface OverviewActivityProps {
  activities: ActivityItem[];
}

export function OverviewActivity({ activities }: OverviewActivityProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "meme_generated":
        return <Sparkles className="w-3.5 h-3.5 text-blue-600" />;
      case "brand_created":
        return <Building2 className="w-3.5 h-3.5 text-purple-600" />;
      case "badge_earned":
      case "achievement_unlocked":
        return <Award className="w-3.5 h-3.5 text-emerald-600" />;
      case "level_up":
      case "streak_milestone":
        return <Zap className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <UserPlus className="w-3.5 h-3.5 text-gray-500" />;
    }
  };

  const getActivityLabel = (item: ActivityItem) => {
    switch (item.activity_type) {
      case "meme_generated":
        return "Generated a new viral brand meme";
      case "brand_created":
        return "Created a new brand workspace";
      case "badge_earned":
        return "Earned a community achievement badge";
      case "achievement_unlocked":
        return "Unlocked a creator milestone";
      case "level_up":
        return "Leveled up creator profile rank";
      case "streak_milestone":
        return "Maintained active daily login streak";
      case "joined":
        return "Joined Virlio platform";
      default:
        return "Updated workspace activity";
    }
  };

  return (
    <div className="virlio-card p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <h2 className="text-sm font-bold text-gray-900 tracking-tight">
            Recent Activity Feed
          </h2>
        </div>
        <span className="text-xs font-semibold text-gray-400">Live</span>
      </div>

      {!activities || activities.length === 0 ? (
        <div className="text-center py-6 text-xs text-gray-500 font-medium">
          No recent activity logged yet. Your actions will appear here.
        </div>
      ) : (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
          {activities.slice(0, 5).map((item) => (
            <div key={item.id} className="relative flex items-start justify-between gap-3">
              <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-xs">
                {getActivityIcon(item.activity_type)}
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-900 leading-snug">
                  {getActivityLabel(item)}
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  {item.created_at ? new Date(item.created_at).toLocaleString() : "Recently"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
