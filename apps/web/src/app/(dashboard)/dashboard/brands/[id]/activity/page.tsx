"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Clock,
  User,
  ShieldCheck,
  Building2,
  ImageIcon,
  Bot,
  Settings,
  Flame,
  Loader2,
  CheckCircle2,
  FileText,
} from "lucide-react";

interface ActivityEvent {
  id: string;
  brand_id: string;
  user_id: string;
  action: string;
  details: any;
  created_at: string;
  user?: {
    name?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
}

export default function BrandActivityPage() {
  const { currentBrand } = useBrand();
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadActivity() {
      if (!currentBrand?.id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/brands/${currentBrand.id}/activity`);
        if (res.ok) {
          const json = await res.json();
          setActivities(json.data || json);
        }
      } catch (err) {
        console.error("Failed to load brand activity:", err);
      } finally {
        setLoading(false);
      }
    }
    loadActivity();
  }, [currentBrand?.id]);

  if (!currentBrand) return null;

  const getActionBadge = (action: string) => {
    const act = action.toUpperCase();
    if (act.includes("CREATE")) return { bg: "bg-blue-50 text-blue-700 border-blue-200", icon: Building2 };
    if (act.includes("VERIF")) return { bg: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: ShieldCheck };
    if (act.includes("AI") || act.includes("KNOWLEDGE")) return { bg: "bg-purple-50 text-purple-700 border-purple-200", icon: Bot };
    if (act.includes("MEDIA") || act.includes("LOGO") || act.includes("BANNER")) return { bg: "bg-pink-50 text-pink-700 border-pink-200", icon: ImageIcon };
    if (act.includes("MEME")) return { bg: "bg-amber-50 text-amber-700 border-amber-200", icon: Flame };
    return { bg: "bg-gray-50 text-gray-700 border-gray-200", icon: Settings };
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Clock className="w-5 h-5 text-blue-600" />
              {currentBrand.name} Activity History & Event Logs
            </h1>
            <p className="text-xs text-gray-500">
              Chronological timeline of brand edits, verification submissions, AI strategy updates, and meme events.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : activities.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No activity recorded"
            description={`Brand activity for ${currentBrand.name} will be logged here as actions take place.`}
            actionLabel="Generate First Meme"
            actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
            iconColor="text-blue-600"
          />
        ) : (
          <div className="space-y-4">
            {activities.map((event) => {
              const badge = getActionBadge(event.action);
              const BadgeIcon = badge.icon;
              const formattedAction = event.action.replace(/_/g, " ");

              return (
                <div
                  key={event.id}
                  className="p-4 bg-white border border-gray-200 rounded-2xl flex items-start gap-4 shadow-2xs hover:border-gray-300 transition-colors"
                >
                  <div className={`p-2.5 rounded-xl border shrink-0 ${badge.bg}`}>
                    <BadgeIcon className="w-5 h-5" />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-900 capitalize">
                        {formattedAction.toLowerCase()}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 font-mono">
                      {event.details ? JSON.stringify(event.details) : "Action completed"}
                    </p>

                    <div className="pt-1 flex items-center gap-1.5 text-[11px] text-gray-500 font-medium">
                      <User className="w-3.5 h-3.5 text-gray-400" />
                      <span>{event.user?.name || "System Administrator"}</span>
                      {event.user?.username && (
                        <span className="text-blue-600 font-mono">(@{event.user.username})</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
