"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Sparkles,
  Plus,
  Layers,
  CheckCircle2,
  Clock,
  ArrowRight,
  Loader2,
  Package,
  Briefcase,
  Share2,
  Calendar,
} from "lucide-react";

export default function BrandPostsLandingPage() {
  const params = useParams();
  const brandId = params.id as string;
  const { currentBrand } = useBrand();

  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSessions() {
      if (!brandId) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/v1/brands/${brandId}/posts/sessions?limit=20`);
        if (res.ok) {
          const json = await res.json();
          setSessions(json.data?.sessions || []);
        }
      } catch (err) {
        console.error("Failed to load post sessions:", err);
      } finally {
        setLoading(false);
      }
    }

    loadSessions();
  }, [brandId]);

  if (!currentBrand) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              <Sparkles className="w-3 h-3" /> Multi-Concept Studio
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900">Brand Social Posts</h1>
          <p className="text-xs sm:text-sm text-gray-500 max-w-2xl">
            Synthesize 4 distinct creative variations for {currentBrand.name} and edit with precision multi-turn versioning.
          </p>
        </div>

        <Link
          href={`/dashboard/brands/${brandId}/posts/create`}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Post Campaign</span>
        </Link>
      </div>

      {/* Sessions & History List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-gray-900">
            Recent Post Campaigns ({sessions.length})
          </h2>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-semibold text-gray-500">Loading campaigns...</p>
          </div>
        ) : sessions.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="No brand post sessions yet"
            description={`Generate your first multi-variation branded post campaign for ${currentBrand.name}.`}
            actionLabel="Create First Campaign"
            actionHref={`/dashboard/brands/${brandId}/posts/create`}
            iconColor="text-blue-600"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="virlio-card bg-white border border-gray-200 rounded-xl p-5 shadow-2xs hover:border-gray-300 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {sess.focus_type === "product" ? (
                        <>
                          <Package className="w-3 h-3 text-blue-600" /> Product
                        </>
                      ) : sess.focus_type === "service" ? (
                        <>
                          <Briefcase className="w-3 h-3 text-purple-600" /> Service
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-amber-600" /> General
                        </>
                      )}
                    </span>

                    <span className="text-[10px] font-mono text-gray-400">
                      {sess.aspect_ratio || "1:1"}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{sess.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {sess.selected_product
                      ? `Focus: ${sess.selected_product}`
                      : sess.selected_service
                      ? `Focus: ${sess.selected_service}`
                      : `Platform: ${sess.target_platform}`}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(sess.created_at).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/dashboard/brands/${brandId}/posts/create?sessionId=${sess.id}`}
                    className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
