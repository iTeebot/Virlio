"use client";

import React from "react";
import Image from "next/image";
import {
  Sparkles,
  Check,
  Edit3,
  Flame,
  Camera,
  Layers,
  Share2,
  Download,
  Copy,
  ExternalLink,
} from "lucide-react";

interface VariationItem {
  id: string;
  variation_index: number;
  creative_direction: "product_hero" | "lifestyle" | "editorial" | "bold_social" | string;
  concept_title: string;
  concept_description: string;
  headline_text?: string | null;
  body_copy?: string | null;
  caption_copy?: string | null;
  hashtags?: string[] | null;
  is_approved?: boolean;
  is_selected?: boolean;
  active_version?: {
    id: string;
    version_number: number;
    image_url: string;
    aspect_ratio: string;
  } | null;
}

interface FourVariationGridProps {
  variations: VariationItem[];
  selectedVariationId?: string;
  onSelectVariation: (variation: VariationItem) => void;
  onApproveVariation?: (variationId: string, approved: boolean) => void;
  isSynthesizing?: boolean;
}

export function FourVariationGrid({
  variations,
  selectedVariationId,
  onSelectVariation,
  onApproveVariation,
  isSynthesizing = false,
}: FourVariationGridProps) {
  const getBadgeStyle = (direction: string) => {
    switch (direction) {
      case "product_hero":
        return {
          label: "Studio Product Hero",
          icon: Camera,
          badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
        };
      case "lifestyle":
        return {
          label: "In-Situ Lifestyle",
          icon: Flame,
          badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "editorial":
        return {
          label: "Minimalist Editorial",
          icon: Layers,
          badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
        };
      case "bold_social":
        return {
          label: "Bold Social Hook",
          icon: Sparkles,
          badgeClass: "bg-amber-50 text-amber-800 border-amber-300",
        };
      default:
        return {
          label: "Creative Direction",
          icon: Sparkles,
          badgeClass: "bg-gray-100 text-gray-800 border-gray-200",
        };
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-gray-900">
            4 Creative Post Concepts
          </h2>
          <p className="text-xs text-gray-500">
            Intelligently diverged across 4 distinct creative strategies. Select any concept to edit or iterate.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {variations.map((v) => {
          const badge = getBadgeStyle(v.creative_direction);
          const Icon = badge.icon;
          const isSelected = selectedVariationId === v.id;
          const imageUrl = v.active_version?.image_url || (v as any).image_url;

          return (
            <div
              key={v.id}
              className={`virlio-card bg-white border rounded-xl flex flex-col overflow-hidden transition-all duration-200 ${
                isSelected
                  ? "border-blue-600 ring-2 ring-blue-600/20 shadow-md"
                  : "border-gray-200 hover:border-gray-300 shadow-2xs"
              }`}
            >
              {/* Header Badge */}
              <div className="p-3 bg-gray-50 border-b border-gray-150 flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badge.badgeClass}`}
                >
                  <Icon className="w-3 h-3" />
                  {badge.label}
                </span>

                {v.is_approved && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
                    <Check className="w-2.5 h-2.5" />
                    Approved
                  </span>
                )}
              </div>

              {/* Image Preview Canvas */}
              <div className="relative aspect-square w-full bg-gray-100 border-b border-gray-150 overflow-hidden flex items-center justify-center">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={v.concept_title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : isSynthesizing ? (
                  <div className="p-6 text-center space-y-2">
                    <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin mx-auto" />
                    <p className="text-xs font-semibold text-gray-700">Synthesizing Visual...</p>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-2">
                    <Camera className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-xs text-gray-500 font-medium">Concept Ready</p>
                  </div>
                )}

                {v.active_version && (
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-black/75 text-white backdrop-blur-xs">
                    v{v.active_version.version_number}
                  </span>
                )}
              </div>

              {/* Content Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{v.concept_title}</h3>
                  {v.headline_text && (
                    <p className="text-xs font-semibold text-blue-950 font-serif line-clamp-2">
                      &ldquo;{v.headline_text}&rdquo;
                    </p>
                  )}
                  <p className="text-[11px] text-gray-600 line-clamp-2">{v.concept_description}</p>
                </div>

                {/* Hashtags preview */}
                {v.hashtags && v.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {v.hashtags.slice(0, 3).map((tag, idx) => (
                      <span key={idx} className="text-[10px] font-mono text-gray-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 border-t border-gray-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectVariation(v)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isSelected ? "Active Editor" : "Select & Edit"}</span>
                  </button>

                  {onApproveVariation && (
                    <button
                      type="button"
                      onClick={() => onApproveVariation(v.id, !v.is_approved)}
                      title={v.is_approved ? "Unapprove" : "Approve as Official Asset"}
                      className={`p-2 rounded-lg border text-xs font-semibold transition-all ${
                        v.is_approved
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-white text-gray-500 border-gray-200 hover:text-gray-900"
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
