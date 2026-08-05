"use client";

import React from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { Layers, Sparkles, ShieldCheck } from "lucide-react";

export default function BrandTemplatesPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Layers className="w-5 h-5 text-purple-600" />
              {currentBrand.name} Brand Templates
            </h1>
            <p className="text-xs text-gray-500">
              Approved public community templates consumed during meme generation.
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-full border border-purple-200">
            Platform Shared
          </span>
        </div>

        <div className="virlio-card p-8 sm:p-12 text-center bg-white border border-gray-200 rounded-3xl space-y-4 max-w-2xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center mx-auto">
            <Sparkles className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 rounded-full">
              Private Template Libraries • Coming Soon
            </span>
            <h2 className="text-lg font-bold text-gray-900">
              Private Brand Template Management
            </h2>
            <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed">
              Brands will soon be able to upload, maintain, and restrict private internal template libraries reserved exclusively for official {currentBrand.name} team campaigns.
            </p>
          </div>

          <div className="pt-2 text-xs text-gray-400 font-medium flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Currently using platform-approved public templates during AI generation</span>
          </div>
        </div>
      </div>
    </div>
  );
}
