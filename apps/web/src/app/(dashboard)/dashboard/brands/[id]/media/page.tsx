"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { SharedImageUploader } from "@/components/brands/shared-image-uploader";
import {
  Image as ImageIcon,
  Save,
  RotateCcw,
  ShieldCheck,
  Globe,
  MapPin,
  Building2,
  CheckCircle2,
  Loader2,
  Eye,
} from "lucide-react";

export default function BrandMediaPage() {
  const { currentBrand, refreshBrands } = useBrand();

  const [logoUrl, setLogoUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [initialLogoUrl, setInitialLogoUrl] = useState("");
  const [initialBannerUrl, setInitialBannerUrl] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!currentBrand) return;
    const lUrl = currentBrand.logo_url || "";
    const bUrl = currentBrand.banner_url || "";
    setLogoUrl(lUrl);
    setBannerUrl(bUrl);
    setInitialLogoUrl(lUrl);
    setInitialBannerUrl(bUrl);
  }, [currentBrand]);

  if (!currentBrand) return null;

  const isDirty = logoUrl !== initialLogoUrl || bannerUrl !== initialBannerUrl;

  const handleUndo = () => {
    setLogoUrl(initialLogoUrl);
    setBannerUrl(initialBannerUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo_url: logoUrl || null,
          banner_url: bannerUrl || null,
        }),
      });

      if (res.ok) {
        setInitialLogoUrl(logoUrl);
        setInitialBannerUrl(bannerUrl);
        setSaveSuccess(true);
        if (refreshBrands) refreshBrands();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update brand media.");
      }
    } catch {
      alert("Network error. Failed to update brand media.");
    } finally {
      setSaving(false);
    }
  };

  const isVerified = currentBrand.verification_status === "verified";

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              {currentBrand.name} Media & Brand Assets
            </h1>
            <p className="text-xs text-gray-500">
              Manage official logos, cover banners, and visual media displayed across Virlio.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isDirty && (
              <button
                type="button"
                onClick={handleUndo}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                <span>Undo Changes</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !isDirty}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Asset Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Media assets updated and synchronized successfully!</span>
          </div>
        )}

        {/* Upload Controls Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Uploader */}
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-blue-600" /> Official Logo Mark
              </span>
              <span className="text-[10px] font-bold text-gray-400">Square (1:1) Recommended</span>
            </div>

            <SharedImageUploader
              value={logoUrl}
              onChange={setLogoUrl}
              label=""
              description="PNG, JPG, WEBP or SVG (Max 5MB)"
              aspectRatio="square"
              folder={`virlio/brands/${currentBrand.id}/logo`}
            />
          </div>

          {/* Banner Uploader */}
          <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-purple-600" /> Cover Header Banner
              </span>
              <span className="text-[10px] font-bold text-gray-400">Landscape (3:1) Recommended</span>
            </div>

            <SharedImageUploader
              value={bannerUrl}
              onChange={setBannerUrl}
              label=""
              description="PNG, JPG or WEBP (Max 8MB)"
              aspectRatio="banner"
              folder={`virlio/brands/${currentBrand.id}/banner`}
            />
          </div>
        </div>

        {/* LIVE PUBLIC PAGE PREVIEW CARD */}
        <div className="pt-6 border-t border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              Live Public Brand Page Header Preview
            </h2>
            <span className="text-[11px] font-semibold text-gray-400">
              Matches /brands/{currentBrand.slug} public layout
            </span>
          </div>

          {/* Responsive Live Preview Card matching /brands/[slug] */}
          <div className="border border-gray-200 rounded-3xl overflow-hidden shadow-xs bg-white">
            {/* Banner Header Area */}
            <div className="relative h-64 sm:h-80 w-full bg-slate-950 overflow-hidden">
              {bannerUrl ? (
                <img src={bannerUrl} alt="Cover Banner Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-r from-slate-950 via-blue-950 to-slate-950 flex items-center justify-center text-slate-500 text-xs font-semibold">
                  No Cover Banner Uploaded
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
            </div>

            {/* Profile Info Overlay */}
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center shrink-0">
                  {logoUrl ? (
                    <img src={logoUrl} alt={currentBrand.name} className="w-full h-full object-contain p-1 rounded-xl" />
                  ) : (
                    <div className="w-full h-full bg-blue-600 text-white font-black text-3xl flex items-center justify-center rounded-xl">
                      {currentBrand.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-2xs">
                    Follow Brand
                  </span>
                  <span className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200">
                    Share
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-gray-900">{currentBrand.name}</h3>
                  {isVerified && <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />}
                </div>

                <p className="text-xs text-gray-500 mt-1 flex items-center gap-3 flex-wrap">
                  <span className="text-blue-600 font-mono font-bold">@{currentBrand.slug}</span>
                  <span>•</span>
                  <span>{currentBrand.industry || "Software & Technology"}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
