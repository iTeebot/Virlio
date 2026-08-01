"use client";

import React from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import {
  Building2,
  ShieldCheck,
  Globe,
  Sparkles,
  Flame,
  Layers,
  Share2,
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function BrandOverviewPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  const isVerified = currentBrand.verification_status === "verified";
  const confidenceScore = currentBrand.ai_confidence_score || currentBrand.digital_presence_score || 0;
  const settings = currentBrand.settings || {};
  const colors = settings.colors || {};
  const metadata = currentBrand.metadata || {};

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
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified • {confidenceScore} / 100 PTS
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-200">
                    <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Verification • {confidenceScore} / 100 PTS
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
              <Sparkles className="w-4 h-4" /> Generate Meme
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

        {/* Brand Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-400 block font-semibold">Business Type</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block">{settings.business_type || "Standard"}</span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-400 block font-semibold">Contact Email</span>
            <span className="font-bold text-blue-600 text-sm mt-0.5 block truncate">
              {currentBrand.contact_email || "Not specified"}
            </span>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <span className="text-gray-400 block font-semibold">Website</span>
            <span className="font-bold text-gray-900 text-sm mt-0.5 block truncate">
              {currentBrand.website || "No website specified"}
            </span>
          </div>
        </div>

        {/* Brand Palette Swatches */}
        {colors.primary && (
          <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
            <span className="text-xs font-bold text-gray-700">Brand Swatches:</span>
            <div className="flex items-center gap-2">
              {colors.primary && <div className="w-6 h-6 rounded-lg border border-gray-200 shadow-2xs" style={{ backgroundColor: colors.primary }} title={`Primary: ${colors.primary}`} />}
              {colors.secondary && <div className="w-6 h-6 rounded-lg border border-gray-200 shadow-2xs" style={{ backgroundColor: colors.secondary }} title={`Secondary: ${colors.secondary}`} />}
              {colors.accent && <div className="w-6 h-6 rounded-lg border border-gray-200 shadow-2xs" style={{ backgroundColor: colors.accent }} title={`Accent: ${colors.accent}`} />}
            </div>
          </div>
        )}
      </div>

      {/* Real Content Sections with Polished Empty States */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Memes Empty State */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-500" /> Recent Memes
            </h3>
            <Link href={`/dashboard/brands/${currentBrand.id}/memes`} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <EmptyState
            icon={Flame}
            title="No memes generated yet"
            description={`Start creating viral memes powered by AI for ${currentBrand.name}.`}
            actionLabel="Generate First Meme"
            actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
            iconColor="text-amber-500"
          />
        </div>

        {/* Templates Empty State */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-600" /> Brand Templates
            </h3>
            <Link href={`/dashboard/brands/${currentBrand.id}/templates`} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <EmptyState
            icon={Layers}
            title="No templates uploaded yet"
            description={`Upload custom meme templates branded with ${currentBrand.name}'s logo and colors.`}
            actionLabel="Browse Templates"
            actionHref={`/dashboard/brands/${currentBrand.id}/templates`}
            iconColor="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
}
