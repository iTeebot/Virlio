"use client";

import React from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { Image as ImageIcon, Camera, FileText } from "lucide-react";

export default function BrandMediaPage() {
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-600" />
          {currentBrand.name} Media Library
        </h1>
        <p className="text-xs text-gray-500">
          Official logos, cover banners, storefront graphics, and business documents.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-2">
          {/* Logo Preview */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-blue-600" /> Official Logo
            </span>
            {currentBrand.logo_url ? (
              <div className="w-full h-32 bg-white border border-gray-200 rounded-xl p-2 flex items-center justify-center overflow-hidden">
                <img src={currentBrand.logo_url} alt="Logo" className="max-h-full object-contain" />
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No logo uploaded</p>
            )}
          </div>

          {/* Banner Preview */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4 text-purple-600" /> Cover Banner
            </span>
            {currentBrand.banner_url ? (
              <div className="w-full h-32 bg-white border border-gray-200 rounded-xl overflow-hidden">
                <img src={currentBrand.banner_url} alt="Banner" className="w-full h-full object-cover" />
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">No cover banner uploaded</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
