"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { AISuggestionBox } from "../ai-suggestion-box";
import { CountrySelect } from "@/components/ui/country-select";
import { Step1BasicInfo } from "@/lib/validations/brand-wizard";
import {
  validateSafetyAndProfanity,
  getSubIndustries,
  normalizeTaxonomyName,
} from "@/lib/validations/brand-taxonomy";
import { Building2, Globe, MapPin, Briefcase, Users, AtSign, Check, AlertCircle, Plus, Loader2 } from "lucide-react";

interface Step1Props {
  data: Step1BasicInfo;
  onChange: (updated: Partial<Step1BasicInfo>) => void;
  errors?: Record<string, string>;
}

const DEFAULT_BUSINESS_TYPES = [
  "Software",
  "Restaurant",
  "Retail",
  "Agency",
  "Healthcare",
  "Education",
  "Real Estate",
  "Construction",
  "Fashion",
  "Electronics",
  "Manufacturing",
];

const DEFAULT_INDUSTRIES = [
  "Technology",
  "Software",
  "Food & Beverage",
  "E-Commerce & Retail",
  "Marketing & Advertising",
  "Healthcare & Wellness",
  "Education & Learning",
  "Fashion & Apparel",
  "Real Estate & Property",
  "Finance & Fintech",
  "Gaming & Entertainment",
  "Construction & Engineering",
  "Consulting & Professional Services",
];

export function Step1BasicInfoComponent({ data, onChange, errors = {} }: Step1Props) {
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugStatus, setSlugStatus] = useState<{ available?: boolean; message?: string } | null>(null);

  // Custom Taxonomy state
  const [customBTypeActive, setCustomBTypeActive] = useState(false);
  const [customBTypeValue, setCustomBTypeValue] = useState("");
  const [customBTypeErr, setCustomBTypeErr] = useState<string | null>(null);

  const [customIndustryActive, setCustomIndustryActive] = useState(false);
  const [customIndustryValue, setCustomIndustryValue] = useState("");
  const [customIndustryErr, setCustomIndustryErr] = useState<string | null>(null);

  const [customSubIndustryActive, setCustomSubIndustryActive] = useState(false);
  const [customSubIndustryValue, setCustomSubIndustryValue] = useState("");
  const [customSubIndustryErr, setCustomSubIndustryErr] = useState<string | null>(null);

  // Brand Name Safety Error state
  const [brandNameSafetyError, setBrandNameSafetyError] = useState<string | null>(null);

  // Auto-generate slug from Brand Name if not manually edited
  const handleBrandNameChange = (val: string) => {
    onChange({ name: val });

    // Validate Brand Name Safety
    if (val.trim()) {
      const check = validateSafetyAndProfanity(val);
      if (!check.isValid) {
        setBrandNameSafetyError(check.reason || "Invalid brand name.");
      } else {
        setBrandNameSafetyError(null);
      }
    } else {
      setBrandNameSafetyError(null);
    }

    // Auto slug generation if user hasn't manually edited slug
    if (!isSlugManuallyEdited) {
      const generatedSlug = val
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "")
        .slice(0, 30);
      onChange({ slug: generatedSlug });
    }
  };

  // Debounced real-time slug availability check
  const checkSlugAvailability = useCallback(async (slugToCheck: string) => {
    if (!slugToCheck || slugToCheck.length < 2) {
      setSlugStatus(null);
      return;
    }

    setSlugChecking(true);
    try {
      const res = await fetch(`/api/v1/brands/check-slug?slug=${encodeURIComponent(slugToCheck)}`);
      const json = await res.json();
      setSlugStatus({ available: json.available, message: json.message });
    } catch (err) {
      setSlugStatus({ available: false, message: "Error checking username" });
    } finally {
      setSlugChecking(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (data.slug) {
        checkSlugAvailability(data.slug);
      } else {
        setSlugStatus(null);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [data.slug, checkSlugAvailability]);

  // Compute dynamic sub-industries based on Business Type & Industry
  const dynamicSubIndustries = useMemo(() => {
    return getSubIndustries(data.business_type, data.industry);
  }, [data.business_type, data.industry]);

  // Submit custom taxonomy entry helper
  const handleAddCustomTaxonomy = async (
    category: "business_type" | "industry" | "sub_industry",
    value: string,
    parentVal: string,
    setErr: (msg: string | null) => void,
    onSuccess: (normalized: string) => void,
    setActive: (val: boolean) => void
  ) => {
    setErr(null);
    const check = validateSafetyAndProfanity(value);
    if (!check.isValid) {
      setErr(check.reason || "Invalid entry.");
      return;
    }

    try {
      const res = await fetch("/api/v1/brands/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, parent_value: parentVal, name: value }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const normalized = json.data.name;
        onSuccess(normalized);
        setActive(false);
      } else {
        setErr(json.message || "Failed to add custom taxonomy.");
      }
    } catch (err: any) {
      setErr(err.message || "Network error");
    }
  };

  const brandContext = {
    name: data.name,
    industry: data.industry,
    city: data.city,
    country: data.country,
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          Step 1: Basic Information
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Define your official brand identity. Fields marked with * are required.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Brand Name - User Owned, NO AI SUGGESTIONS */}
        <div>
          <label htmlFor="field-name" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-gray-500" />
            Brand Name *
          </label>
          <input
            id="field-name"
            type="text"
            value={data.name}
            onChange={(e) => handleBrandNameChange(e.target.value)}
            placeholder="e.g. Acme Corporation"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-400 shadow-xs ${
              errors.name || brandNameSafetyError
                ? "border-red-500 focus:ring-red-500/20"
                : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-600"
            }`}
          />
          {brandNameSafetyError ? (
            <p className="text-xs text-red-600 mt-1 font-medium">{brandNameSafetyError}</p>
          ) : errors.name ? (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.name}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">User-owned field. Minimum 3 characters.</p>
          )}
        </div>

        {/* Username / Slug Handle - Auto Sync & Realtime Availability - NO AI ACTIONS */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="field-slug" className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
              <AtSign className="w-4 h-4 text-gray-500" />
              Public Username Handle (@slug) *
            </label>
            {slugChecking && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking...
              </span>
            )}
          </div>
          <div className="relative">
            <input
              id="field-slug"
              type="text"
              value={data.slug}
              onChange={(e) => {
                setIsSlugManuallyEdited(true);
                const val = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
                onChange({ slug: val });
              }}
              placeholder="e.g. acme"
              className={`w-full px-3.5 py-2.5 text-sm bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-400 shadow-xs ${
                slugStatus && !slugStatus.available
                  ? "border-red-500 focus:ring-red-500/20"
                  : slugStatus?.available
                  ? "border-emerald-500 focus:ring-emerald-500/20"
                  : errors.slug
                  ? "border-red-500 focus:ring-red-500/20"
                  : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-600"
              }`}
            />
            {slugStatus?.available && (
              <span className="absolute right-3 top-3 text-emerald-600 text-xs font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Available
              </span>
            )}
          </div>
          {slugStatus && !slugStatus.available ? (
            <p className="text-xs text-red-600 mt-1 font-medium flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" /> {slugStatus.message}
            </p>
          ) : errors.slug ? (
            <p className="text-xs text-red-600 mt-1 font-medium">{errors.slug}</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">
              {isSlugManuallyEdited
                ? "Custom handle. Only lowercase letters, numbers, and hyphens."
                : "Auto-synced with Brand Name. Edit directly to set custom handle."}
            </p>
          )}
        </div>
      </div>

      {/* Business Type & Industry Selects with Custom Add Option */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Business Type */}
        <div>
          <label htmlFor="field-business_type" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-gray-500" />
            Business Type *
          </label>
          {!customBTypeActive ? (
            <select
              id="field-business_type"
              value={data.business_type}
              onChange={(e) => {
                if (e.target.value === "ADD_CUSTOM") {
                  setCustomBTypeActive(true);
                } else {
                  onChange({ business_type: e.target.value as any });
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
            >
              <option value="">Select Business Type</option>
              {DEFAULT_BUSINESS_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
              <option value="ADD_CUSTOM">+ Add Custom Business Type...</option>
            </select>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customBTypeValue}
                  onChange={(e) => setCustomBTypeValue(e.target.value)}
                  placeholder="Enter custom business type..."
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddCustomTaxonomy(
                      "business_type",
                      customBTypeValue,
                      "",
                      setCustomBTypeErr,
                      (norm) => onChange({ business_type: norm as any }),
                      setCustomBTypeActive
                    )
                  }
                  className="px-3.5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setCustomBTypeActive(false)}
                  className="px-3 py-2 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-xl"
                >
                  Cancel
                </button>
              </div>
              {customBTypeErr && <p className="text-xs text-red-600 font-medium">{customBTypeErr}</p>}
            </div>
          )}
        </div>

        {/* Industry Sector */}
        <div>
          <label htmlFor="field-industry" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-gray-500" />
            Industry Sector *
          </label>
          {!customIndustryActive ? (
            <select
              id="field-industry"
              value={data.industry}
              onChange={(e) => {
                if (e.target.value === "ADD_CUSTOM") {
                  setCustomIndustryActive(true);
                } else {
                  onChange({ industry: e.target.value });
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
            >
              <option value="">Select Primary Industry</option>
              {DEFAULT_INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
              <option value="ADD_CUSTOM">+ Add Custom Industry...</option>
            </select>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customIndustryValue}
                  onChange={(e) => setCustomIndustryValue(e.target.value)}
                  placeholder="Enter custom industry..."
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddCustomTaxonomy(
                      "industry",
                      customIndustryValue,
                      data.business_type,
                      setCustomIndustryErr,
                      (norm) => onChange({ industry: norm }),
                      setCustomIndustryActive
                    )
                  }
                  className="px-3.5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setCustomIndustryActive(false)}
                  className="px-3 py-2 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-xl"
                >
                  Cancel
                </button>
              </div>
              {customIndustryErr && <p className="text-xs text-red-600 font-medium">{customIndustryErr}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Sub-Industry / Niche & Employee Size */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Dynamic Sub-Industry */}
        <div>
          <label htmlFor="field-sub_industry" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-gray-500" />
            Sub-Industry / Niche (Dynamic)
          </label>
          {!customSubIndustryActive ? (
            <select
              id="field-sub_industry"
              value={data.sub_industry || ""}
              onChange={(e) => {
                if (e.target.value === "ADD_CUSTOM") {
                  setCustomSubIndustryActive(true);
                } else {
                  onChange({ sub_industry: e.target.value });
                }
              }}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
            >
              <option value="">Select Niche / Sub-Industry</option>
              {dynamicSubIndustries.map((sub: string) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
              <option value="ADD_CUSTOM">+ Add Custom Sub-Industry...</option>
            </select>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customSubIndustryValue}
                  onChange={(e) => setCustomSubIndustryValue(e.target.value)}
                  placeholder="Enter custom niche/sub-industry..."
                  className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddCustomTaxonomy(
                      "sub_industry",
                      customSubIndustryValue,
                      data.industry,
                      setCustomSubIndustryErr,
                      (norm) => onChange({ sub_industry: norm }),
                      setCustomSubIndustryActive
                    )
                  }
                  className="px-3.5 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSubIndustryActive(false)}
                  className="px-3 py-2 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-xl"
                >
                  Cancel
                </button>
              </div>
              {customSubIndustryErr && <p className="text-xs text-red-600 font-medium">{customSubIndustryErr}</p>}
            </div>
          )}
        </div>

        {/* Employee Size - NO AI ACTION */}
        <div>
          <label htmlFor="field-employee_size" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-gray-500" />
            Employee Size (Optional)
          </label>
          <input
            id="field-employee_size"
            type="text"
            value={data.employee_size || ""}
            onChange={(e) => onChange({ employee_size: e.target.value })}
            placeholder="e.g. 1-10 employees, 11-50 employees"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs"
          />
        </div>
      </div>

      {/* Short Description - CREATIVE FIELD - HAS AI ASSISTANT */}
      <div>
        <AISuggestionBox
          step={1}
          field="shortDescription"
          label="Short Description *"
          placeholder="Describe what your brand does, your key values, and products..."
          multiline
          rows={3}
          currentValue={data.short_description}
          brandContext={brandContext}
          onAccept={(val) => onChange({ short_description: val })}
          helperText="AI will refine grammar, add active SEO keywords, and polish your brand pitch."
        />
        {errors.short_description && <p className="text-xs text-red-600 mt-1 font-medium">{errors.short_description}</p>}
      </div>

      {/* Location Details: Searchable CountrySelect & City/State */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <CountrySelect
            id="field-country"
            label="Country *"
            value={data.country}
            onChange={(val) => onChange({ country: val })}
            error={errors.country}
          />
        </div>

        <div>
          <label htmlFor="field-state_province" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-500" />
            State / Province
          </label>
          <input
            id="field-state_province"
            type="text"
            value={data.state_province || ""}
            onChange={(e) => onChange({ state_province: e.target.value })}
            placeholder="e.g. Punjab, California"
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs"
          />
        </div>

        <div>
          <label htmlFor="field-city" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gray-500" />
            City *
          </label>
          <input
            id="field-city"
            type="text"
            value={data.city}
            onChange={(e) => onChange({ city: e.target.value })}
            placeholder="e.g. Lahore, New York"
            className={`w-full px-3.5 py-2.5 text-sm bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 placeholder-gray-400 shadow-xs ${
              errors.city ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-600"
            }`}
          />
          {errors.city && <p className="text-xs text-red-600 mt-1 font-medium">{errors.city}</p>}
        </div>
      </div>
    </div>
  );
}
