"use client";

import React from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Clock } from "lucide-react";

export default function BrandActivityPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Clock className="w-5 h-5 text-blue-600" />
          {currentBrand.name} Activity History
        </h1>
        <p className="text-xs text-gray-500">
          Timeline of brand creation, meme generations, template uploads, and profile edits.
        </p>

        <EmptyState
          icon={Clock}
          title="No recent activity recorded"
          description={`Brand activity for ${currentBrand.name} will be logged here as memes are rendered and settings updated.`}
          actionLabel="Generate First Meme"
          actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
          iconColor="text-blue-600"
        />
      </div>
    </div>
  );
}
