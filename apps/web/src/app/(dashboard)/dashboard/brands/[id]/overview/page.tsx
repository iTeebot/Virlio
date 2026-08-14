"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Building2,
  ShieldCheck,
  Globe,
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  ExternalLink,
  MapPin,
  Users,
  Eye,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

function MemeThumbnail({ src, alt, caption }: { src?: string | null; alt: string; caption?: string }) {
  const [imgError, setImgError] = useState(!src);

  if (imgError || !src) {
    return (
      <div className="w-full h-full bg-slate-900 text-white p-2 flex flex-col items-center justify-center text-center">
        <Flame className="w-5 h-5 text-amber-500 mb-1" />
        <span className="text-[9px] font-bold line-clamp-2">{caption || alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setImgError(true)}
      className="w-full h-full object-cover"
    />
  );
}

export default function BrandOverviewPage() {
  const { currentBrand } = useBrand();

  const [stats, setStats] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOverviewData() {
      if (!currentBrand?.id) return;
      try {
        setLoading(true);
        const [statsRes, actRes] = await Promise.all([
          fetch(`/api/v1/brands/${currentBrand.id}/stats`),
          fetch(`/api/v1/brands/${currentBrand.id}/activity`),
        ]);

        if (statsRes.ok) {
          const json = await statsRes.json();
          setStats(json.data || json);
        }

        if (actRes.ok) {
          const json = await actRes.json();
          setActivities(json.data || json);
        }
      } catch (err) {
        console.error("Failed to load overview data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadOverviewData();
  }, [currentBrand?.id]);

  if (!currentBrand) return null;

  const isVerified = currentBrand.verification_status === "verified";
  const brandScore = currentBrand.ai_confidence_score ?? currentBrand.brand_score ?? stats?.brand_score ?? 0;
  const recentMemes = stats?.recent_memes || [];

  return (
    <div className="space-y-6">
      {/* Brand Hero Summary Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border border-gray-200 p-1 shadow-xs shrink-0 flex items-center justify-center overflow-hidden">
              {currentBrand.logo_url ? (
                <img src={currentBrand.logo_url} alt={currentBrand.name} className="w-full h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full bg-blue-600 text-white font-black text-2xl flex items-center justify-center rounded-xl">
                  {currentBrand.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-black text-gray-900">{currentBrand.name}</h1>
                {isVerified ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified • {brandScore} / 100 PTS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Verification • {brandScore} / 100 PTS
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm font-semibold text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                <span className="text-blue-600 font-mono font-bold">@{currentBrand.slug}</span>
                <span>•</span>
                <span>{currentBrand.industry || "Business"}</span>
                {currentBrand.country && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {currentBrand.country}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Link
              href={`/dashboard/brands/${currentBrand.id}/generate`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" /> Generate Meme
            </Link>

            <a
              href={`/brands/${currentBrand.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
            >
              <Globe className="w-4 h-4" /> Public Page
              <ExternalLink className="w-3 h-3 text-gray-400" />
            </a>
          </div>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Memes</span>
            <span className="text-xl font-black text-gray-900">{stats?.total_memes ?? 0}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Public Feed</span>
            <span className="text-xl font-black text-emerald-600">{stats?.public_memes ?? 0}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Views</span>
            <span className="text-xl font-black text-blue-600">{stats?.total_views ?? 0}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Brand Score</span>
            <span className="text-xl font-black text-purple-600">{brandScore}/100</span>
          </div>
        </div>
      </div>

      {/* Real Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Memes Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> Recent Memes
            </h3>
            <Link
              href={`/dashboard/brands/${currentBrand.id}/memes`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View Library <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : recentMemes.length === 0 ? (
            <EmptyState
              icon={Flame}
              title="No memes generated yet"
              description={`Start creating viral memes powered by AI for ${currentBrand.name}.`}
              actionLabel="Generate First Meme"
              actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
              iconColor="text-amber-500"
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {recentMemes.map((meme: any) => (
                <div key={meme.id} className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-gray-200">
                  <MemeThumbnail
                    src={meme.cloudinary_secure_url || meme.image_url}
                    alt={meme.top_text || meme.bottom_text || "Branded Meme"}
                    caption={meme.top_text || meme.bottom_text || "Branded Meme"}
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2 text-center text-[10px] font-bold text-white">
                    {meme.top_text || meme.bottom_text || "Branded Meme"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" /> Recent Activity
            </h3>
            <Link
              href={`/dashboard/brands/${currentBrand.id}/activity`}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              View History <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          ) : activities.length === 0 ? (
            <EmptyState
              icon={Clock}
              title="No recent activity recorded"
              description={`Brand events for ${currentBrand.name} will be logged here as memes are generated.`}
              actionLabel="Generate Meme"
              actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
              iconColor="text-blue-600"
            />
          ) : (
            <div className="space-y-3">
              {activities.slice(0, 5).map((act: any) => (
                <div key={act.id} className="flex items-center justify-between text-xs p-3 bg-gray-50 border border-gray-100 rounded-2xl">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                    <div>
                      <span className="font-bold text-gray-900 block">{act.action.replace(/_/g, " ")}</span>
                      <span className="text-[10px] text-gray-400 block">
                        {act.user?.name ? `By ${act.user.name}` : "System Event"}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-gray-400 font-semibold shrink-0">
                    {new Date(act.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
