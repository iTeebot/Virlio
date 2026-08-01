"use client";

import React from "react";
import { CheckCircle2, Edit3, Building2, Palette, Users, ShoppingBag, MessageSquare } from "lucide-react";

interface Step9Props {
  fullWizardData: any;
  onJumpToStep: (step: number) => void;
}

export function Step9ReviewComponent({ fullWizardData, onJumpToStep }: Step9Props) {
  const { step1, step2, step3, step4, step5 } = fullWizardData;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          Step 9: Review & Submit Brand Workspace
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Review all your collected information before final submission. You can click Edit on any section to modify.
        </p>
      </div>

      {/* Basic Info Summary */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Basic Information
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(1)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Step 1
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-500 block font-medium">Brand Name</span>
            <span className="text-gray-900 font-bold">{step1.name}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Username Handle</span>
            <span className="text-blue-600 font-bold">@{step1.slug}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Business Type</span>
            <span className="text-gray-900 font-bold">{step1.business_type}</span>
          </div>
          <div>
            <span className="text-gray-500 block font-medium">Industry</span>
            <span className="text-gray-900 font-bold">{step1.industry}</span>
          </div>
        </div>
        <p className="text-xs text-gray-700 italic pt-1 border-t border-gray-100">"{step1.short_description}"</p>
      </div>

      {/* Visual Identity Summary */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-4 h-4 text-purple-600" />
            Brand Visual Identity
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(2)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Step 2
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {step2.logo_url && (
            <img src={step2.logo_url} alt="Logo" className="w-12 h-12 object-contain bg-gray-50 p-1 rounded-xl border border-gray-200" />
          )}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md border border-gray-300 shadow-xs" style={{ backgroundColor: step2.primary_color }} title="Primary" />
            <div className="w-6 h-6 rounded-md border border-gray-300 shadow-xs" style={{ backgroundColor: step2.secondary_color }} title="Secondary" />
            <div className="w-6 h-6 rounded-md border border-gray-300 shadow-xs" style={{ backgroundColor: step2.accent_color }} title="Accent" />
            <div className="w-6 h-6 rounded-md border border-gray-300 shadow-xs" style={{ backgroundColor: step2.dark_bg_color }} title="Dark BG" />
            <div className="w-6 h-6 rounded-md border border-gray-300 shadow-xs" style={{ backgroundColor: step2.light_bg_color }} title="Light BG" />
          </div>
          <div className="text-xs text-gray-700 font-semibold ml-auto">
            Font: {step2.typography} | Style: {step2.brand_style}
          </div>
        </div>
      </div>

      {/* Audience Summary */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-600" />
            Target Audience
          </h3>
          <button
            type="button"
            onClick={() => onJumpToStep(3)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
          >
            <Edit3 className="w-3.5 h-3.5" /> Edit Step 3
          </button>
        </div>
        <div className="text-xs text-gray-700 space-y-1">
          <p><strong className="text-gray-500">Customer Type:</strong> {step3.customer_type}</p>
          <p><strong className="text-gray-500">Target Ages:</strong> {(step3.target_age_groups || []).join(", ")}</p>
          <p><strong className="text-gray-500">Interests:</strong> {(step3.audience_interests || []).join(", ")}</p>
        </div>
      </div>

      {/* Products & Voice */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
              Products & USPs
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(4)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Step 4
            </button>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <p><strong className="text-gray-500">Price Tier:</strong> {step4.price_range}</p>
            <p><strong className="text-gray-500">Flagship:</strong> {step4.best_seller || "N/A"}</p>
            <p><strong className="text-gray-500">USPs:</strong> {(step4.usps || []).join("; ")}</p>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-200 rounded-2xl space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-pink-600" />
              Brand Voice
            </h3>
            <button
              type="button"
              onClick={() => onJumpToStep(5)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Step 5
            </button>
          </div>
          <div className="text-xs text-gray-700 space-y-1">
            <p><strong className="text-gray-500">Tone:</strong> {step5.brand_tone}</p>
            <p><strong className="text-gray-500">Tagline:</strong> "{step5.tagline}"</p>
            <p><strong className="text-gray-500">Mission:</strong> {step5.mission}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
