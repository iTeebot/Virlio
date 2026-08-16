"use client";

import React from "react";
import { Palette, Type, Shield, Sparkles, Package, Briefcase } from "lucide-react";
import { BrandVisualProfile } from "@virlio/ai";

interface BrandVisualSummaryProps {
  profile: BrandVisualProfile;
}

export function BrandVisualSummary({ profile }: BrandVisualSummaryProps) {
  const { colors, typography, visualStyle, catalog, businessType } = profile;

  return (
    <div className="virlio-card p-4 sm:p-5 bg-white border border-gray-200 rounded-xl space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900">
              Brand Visual Identity
            </h3>
            <p className="text-[11px] text-gray-500">
              {profile.brandName} • {profile.industry} (
              <span className="capitalize font-semibold text-gray-700">{businessType}</span> Focus)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {catalog.hasProducts && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Package className="w-3 h-3" />
              {catalog.products.length} Products
            </span>
          )}
          {catalog.hasServices && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Briefcase className="w-3 h-3" />
              {catalog.services.length} Services
            </span>
          )}
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <Type className="w-3 h-3" />
            {typography.fontFamily}
          </span>
        </div>
      </div>

      {/* Solid Color Tokens Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-150">
          <div
            className="w-5 h-5 rounded-md border border-black/10 shrink-0 shadow-2xs"
            style={{ backgroundColor: colors.primary }}
          />
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-gray-500 uppercase">Primary</span>
            <span className="block text-[11px] font-mono font-medium text-gray-900 truncate">
              {colors.primary}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-150">
          <div
            className="w-5 h-5 rounded-md border border-black/10 shrink-0 shadow-2xs"
            style={{ backgroundColor: colors.secondary }}
          />
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-gray-500 uppercase">Secondary</span>
            <span className="block text-[11px] font-mono font-medium text-gray-900 truncate">
              {colors.secondary}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-150">
          <div
            className="w-5 h-5 rounded-md border border-black/10 shrink-0 shadow-2xs"
            style={{ backgroundColor: colors.accent }}
          />
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-gray-500 uppercase">Accent</span>
            <span className="block text-[11px] font-mono font-medium text-gray-900 truncate">
              {colors.accent}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-150">
          <div
            className="w-5 h-5 rounded-md border border-black/10 shrink-0 shadow-2xs"
            style={{ backgroundColor: colors.darkBackground }}
          />
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-gray-500 uppercase">Dark Bg</span>
            <span className="block text-[11px] font-mono font-medium text-gray-900 truncate">
              {colors.darkBackground}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-150">
          <div
            className="w-5 h-5 rounded-md border border-black/10 shrink-0 shadow-2xs"
            style={{ backgroundColor: colors.lightBackground }}
          />
          <div className="min-w-0">
            <span className="block text-[9px] font-bold text-gray-500 uppercase">Light Bg</span>
            <span className="block text-[11px] font-mono font-medium text-gray-900 truncate">
              {colors.lightBackground}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between text-[11px] text-gray-500 pt-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Style Preset: <strong className="text-gray-800">{visualStyle.stylePreset}</strong></span>
          <span>•</span>
          <span>Tone: <strong className="text-gray-800">{visualStyle.toneOfVoice}</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Shield className="w-3 h-3 text-emerald-600" />
          <span>Solid colors enforced • Zero gradients</span>
        </div>
      </div>
    </div>
  );
}
