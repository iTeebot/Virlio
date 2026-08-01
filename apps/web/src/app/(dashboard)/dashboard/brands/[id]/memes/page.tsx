"use client";

import React from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Flame } from "lucide-react";

export default function BrandMemesPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Flame className="w-5 h-5 text-amber-500" />
          {currentBrand.name} Meme Library
        </h1>
        <p className="text-xs text-gray-500">
          All memes generated for {currentBrand.name}.
        </p>

        <EmptyState
          icon={Flame}
          title="No memes in library"
          description={`No memes have been generated for ${currentBrand.name} yet.`}
          actionLabel="Generate First Meme"
          actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
          iconColor="text-amber-500"
        />
      </div>
    </div>
  );
}
