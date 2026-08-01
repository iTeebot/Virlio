"use client";

import React from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { AlertTriangle, Trash2 } from "lucide-react";

export default function BrandDangerZonePage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-red-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h1 className="text-xl font-bold text-red-600 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          {currentBrand.name} Danger Zone
        </h1>
        <p className="text-xs text-gray-600">
          Destructive actions. Once deleted or archived, brand data cannot be recovered.
        </p>

        <div className="p-5 bg-red-50/60 border border-red-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-sm font-bold text-red-900">Delete Brand Permanently</h3>
            <p className="text-xs text-red-700 mt-0.5">
              Permanently remove <span className="font-bold">@{currentBrand.slug}</span> and all associated AI knowledge, templates, and memes.
            </p>
          </div>

          <button
            type="button"
            onClick={() => alert("Please contact support or brand administrator to confirm permanent brand deletion.")}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors shadow-xs shrink-0"
          >
            <Trash2 className="w-4 h-4" /> Delete Brand
          </button>
        </div>
      </div>
    </div>
  );
}
