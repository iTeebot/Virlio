"use client";

import React from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import { BarChart2 } from "lucide-react";

export default function BrandStatisticsPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          <BarChart2 className="w-5 h-5 text-blue-600" />
          {currentBrand.name} Analytics & Performance
        </h1>
        <p className="text-xs text-gray-500">
          Track views, engagements, upvotes, and viral performance metrics.
        </p>

        <EmptyState
          icon={BarChart2}
          title="No analytics recorded yet"
          description={`Performance statistics and engagement metrics for ${currentBrand.name} will automatically populate here as memes are generated and shared.`}
          actionLabel="Generate First Meme"
          actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
          iconColor="text-blue-600"
        />
      </div>
    </div>
  );
}
