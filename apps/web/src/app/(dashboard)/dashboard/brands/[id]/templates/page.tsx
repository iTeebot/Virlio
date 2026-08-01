"use client";

import React from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Layers } from "lucide-react";

export default function BrandTemplatesPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
          <Layers className="w-5 h-5 text-purple-600" />
          {currentBrand.name} Brand Templates
        </h1>
        <p className="text-xs text-gray-500">
          Upload and manage custom meme templates branded for {currentBrand.name}.
        </p>

        <EmptyState
          icon={Layers}
          title="No custom templates uploaded"
          description={`No brand templates have been created for ${currentBrand.name} yet.`}
          actionLabel="Upload Template"
          actionHref="/dashboard/templates/upload"
          iconColor="text-purple-600"
        />
      </div>
    </div>
  );
}
