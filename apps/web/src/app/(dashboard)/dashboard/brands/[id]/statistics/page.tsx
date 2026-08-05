"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  BarChart2,
  Flame,
  Eye,
  ThumbsUp,
  Globe,
  FileEdit,
  Sparkles,
  Award,
  Layers,
  ArrowRight,
  Loader2,
  TrendingUp,
  Clock,
} from "lucide-react";

function MemeThumbnail({ src, alt, caption }: { src?: string | null; alt: string; caption?: string }) {
  const [imgError, setImgError] = useState(!src);

  if (imgError || !src) {
    return (
      <div className="w-full h-full bg-slate-900 text-white p-2 flex flex-col items-center justify-center text-center">
        <Flame className="w-4 h-4 text-amber-500 mb-1" />
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

export default function BrandStatisticsPage() {
  const { currentBrand } = useBrand();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!currentBrand?.id) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/brands/${currentBrand.id}/stats`);
        if (res.ok) {
          const json = await res.json();
          setStats(json.data || json);
        }
      } catch (err) {
        console.error("Failed to load brand statistics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [currentBrand?.id]);

  if (!currentBrand) return null;

  const totalMemes = stats?.total_memes ?? 0;
  const topMeme = stats?.top_performing_meme || null;
  const mostUsedTemplate = stats?.most_used_template || null;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              {currentBrand.name} Analytics & Performance
            </h1>
            <p className="text-xs text-gray-500">
              Real-time database analytics tracking views, upvotes, template performance, and meme reach.
            </p>
          </div>

          <Link
            href={`/dashboard/brands/${currentBrand.id}/generate`}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span>Generate Meme</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : totalMemes === 0 ? (
          <EmptyState
            icon={BarChart2}
            title="No analytics recorded yet"
            description={`Performance statistics and engagement metrics for ${currentBrand.name} will automatically populate here as memes are generated and shared.`}
            actionLabel="Generate First Meme"
            actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
            iconColor="text-blue-600"
          />
        ) : (
          <div className="space-y-8">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-500" /> Total Memes
                </span>
                <span className="text-2xl font-black text-gray-900 block">{stats.total_memes}</span>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-emerald-600" /> Public Memes
                </span>
                <span className="text-2xl font-black text-emerald-600 block">{stats.public_memes}</span>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-blue-600" /> Total Views
                </span>
                <span className="text-2xl font-black text-blue-600 block">{stats.total_views}</span>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-purple-600" /> Total Upvotes
                </span>
                <span className="text-2xl font-black text-purple-600 block">{stats.total_upvotes}</span>
              </div>
            </div>

            {/* Performance Spotlight Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Top Performing Meme */}
              <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-2xs">
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-500" /> Top Performing Meme
                </span>

                {topMeme ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-slate-950 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                      <MemeThumbnail
                        src={topMeme.cloudinary_secure_url || topMeme.image_url}
                        alt={topMeme.top_text || topMeme.bottom_text || "Top Meme"}
                        caption={topMeme.top_text || topMeme.bottom_text || "Top Meme"}
                      />
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {topMeme.top_text || topMeme.bottom_text || "Branded Meme"}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-gray-500 font-semibold">
                        <span className="text-purple-600 font-bold">{topMeme.engagement_score || 0} Upvotes</span>
                        <span>•</span>
                        <span>{new Date(topMeme.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No meme data recorded</p>
                )}
              </div>

              {/* Most Used Template */}
              <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-2xs">
                <span className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-600" /> Most Used Template
                </span>

                {mostUsedTemplate ? (
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                      {mostUsedTemplate.url ? (
                        <img src={mostUsedTemplate.url} alt="Template" className="w-full h-full object-cover" />
                      ) : (
                        <Layers className="w-8 h-8 text-purple-600" />
                      )}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <p className="text-xs font-bold text-gray-900 truncate">
                        {mostUsedTemplate.title || "Community Template"}
                      </p>
                      <p className="text-[11px] font-semibold text-gray-500">
                        Used in <strong className="text-gray-900">{mostUsedTemplate.count}</strong> meme generations
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">No template usage recorded yet</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
