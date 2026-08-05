"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { CountrySelect } from "@/components/ui/country-select";
import { BrandStyleSelect } from "@/components/ui/brand-style-select";
import { SharedImageUploader } from "@/components/brands/shared-image-uploader";
import { extractColorsFromImage } from "@/lib/utils/color-extractor";
import {
  Settings,
  Save,
  Phone,
  MessageSquare,
  Globe,
  Mail,
  Building2,
  Palette,
  Eye,
  CheckCircle2,
  Loader2,
  Sparkles,
  Plus,
  Trash2,
  ImageIcon,
  X,
} from "lucide-react";

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
  "Consulting",
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

const DEFAULT_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Japanese",
  "Chinese",
  "Portuguese",
  "Italian",
  "Arabic",
  "Hindi",
  "Urdu",
  "Russian",
];

const BRAND_TONES = [
  "Friendly & Informative",
  "Witty & Humorous",
  "Professional & Authoritative",
  "Bold & Rebellious",
  "Educational & Helpful",
  "Casual & Relatable",
  "Sarcastic & Edgier",
  "Luxury & Refined",
  "Playful & Quirky",
];

interface CustomColorToken {
  name: string;
  hex: string;
}

export default function BrandSettingsPage() {
  const { currentBrand, refreshBrands } = useBrand();

  const [formData, setFormData] = useState({
    name: "",
    legal_name: "",
    description: "",
    logo_url: "",
    banner_url: "",
    palette_image_url: "",
    contact_email: "",
    support_email: "",
    phone: "",
    whatsapp_phone: "",
    website: "",
    country: "United States",
    language: "English",
    industry: "Software",
    sub_industry: "B2B SaaS",
    business_type: "Software",
    visibility: "public",
    allow_public_generation: true,
    allow_public_profile: true,
    social_x: "",
    social_instagram: "",
    social_linkedin: "",
    social_facebook: "",
    social_tiktok: "",
    social_youtube: "",
    color_primary: "#2563eb",
    color_secondary: "#7c3aed",
    color_accent: "#f59e0b",
    color_dark_bg: "#0f172a",
    color_light_bg: "#f8fafc",
    brand_style: "Modern",
    brand_voice: "Friendly & Informative",
  });

  // Custom tokens & dropdown toggles
  const [customColors, setCustomColors] = useState<CustomColorToken[]>([]);
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#3B82F6");

  const [customBTypeActive, setCustomBTypeActive] = useState(false);
  const [customBTypeValue, setCustomBTypeValue] = useState("");

  const [customIndustryActive, setCustomIndustryActive] = useState(false);
  const [customIndustryValue, setCustomIndustryValue] = useState("");

  const [customLanguageActive, setCustomLanguageActive] = useState(false);
  const [customLanguageValue, setCustomLanguageValue] = useState("");

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [extractingColors, setExtractingColors] = useState(false);

  useEffect(() => {
    if (!currentBrand) return;
    const settings = currentBrand.settings || {};
    const colors = settings.colors || {};
    const social = currentBrand.social_links || {};

    setFormData({
      name: currentBrand.name || "",
      legal_name: currentBrand.legal_name || "",
      description: currentBrand.description || "",
      logo_url: currentBrand.logo_url || "",
      banner_url: currentBrand.banner_url || "",
      palette_image_url: settings.palette_image_url || "",
      contact_email: currentBrand.contact_email || "",
      support_email: currentBrand.support_email || "",
      phone: currentBrand.phone || "",
      whatsapp_phone: currentBrand.whatsapp_phone || "",
      website: currentBrand.website || "",
      country: currentBrand.country || "United States",
      language: currentBrand.language || "English",
      industry: currentBrand.industry || "Software",
      sub_industry: currentBrand.sub_industry || "B2B SaaS",
      business_type: settings.business_type || "Software",
      visibility: currentBrand.visibility || "public",
      allow_public_generation: currentBrand.allow_public_generation ?? true,
      allow_public_profile: currentBrand.allow_public_profile ?? true,
      social_x: social.x || "",
      social_instagram: social.instagram || "",
      social_linkedin: social.linkedin || "",
      social_facebook: social.facebook || "",
      social_tiktok: social.tiktok || "",
      social_youtube: social.youtube || "",
      color_primary: colors.primary || "#2563eb",
      color_secondary: colors.secondary || "#7c3aed",
      color_accent: colors.accent || "#f59e0b",
      color_dark_bg: colors.dark_bg || "#0f172a",
      color_light_bg: colors.light_bg || "#f8fafc",
      brand_style: settings.brand_style || "Modern",
      brand_voice: settings.brand_voice || "Friendly & Informative",
    });

    if (settings.custom_colors && Array.isArray(settings.custom_colors)) {
      setCustomColors(settings.custom_colors);
    }
  }, [currentBrand]);

  if (!currentBrand) return null;

  const runExtractFromImage = async (url: string) => {
    if (!url) return;
    setExtractingColors(true);
    try {
      const palette = await extractColorsFromImage(url);
      setFormData((prev) => ({
        ...prev,
        color_primary: palette.primary || prev.color_primary,
        color_secondary: palette.secondary || prev.color_secondary,
        color_accent: palette.accent || prev.color_accent,
        color_dark_bg: palette.darkBackground || prev.color_dark_bg,
        color_light_bg: palette.lightBackground || prev.color_light_bg,
      }));
    } catch {
      alert("Could not extract color palette from image.");
    } finally {
      setExtractingColors(false);
    }
  };

  const handleAddCustomColorToken = () => {
    if (!newColorName.trim()) return;
    setCustomColors([...customColors, { name: newColorName.trim(), hex: newColorHex }]);
    setNewColorName("");
    setNewColorHex("#3B82F6");
  };

  const handleRemoveCustomColorToken = (index: number) => {
    setCustomColors(customColors.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        name: formData.name,
        legal_name: formData.legal_name,
        description: formData.description,
        logo_url: formData.logo_url || null,
        banner_url: formData.banner_url || null,
        contact_email: formData.contact_email,
        support_email: formData.support_email,
        phone: formData.phone,
        whatsapp_phone: formData.whatsapp_phone,
        website: formData.website,
        country: formData.country,
        language: formData.language,
        industry: formData.industry,
        sub_industry: formData.sub_industry,
        visibility: formData.visibility,
        allow_public_generation: formData.allow_public_generation,
        allow_public_profile: formData.allow_public_profile,
        social_links: {
          x: formData.social_x,
          instagram: formData.social_instagram,
          linkedin: formData.social_linkedin,
          facebook: formData.social_facebook,
          tiktok: formData.social_tiktok,
          youtube: formData.social_youtube,
        },
        settings: {
          ...(currentBrand.settings || {}),
          business_type: formData.business_type,
          brand_style: formData.brand_style,
          brand_voice: formData.brand_voice,
          palette_image_url: formData.palette_image_url,
          colors: {
            primary: formData.color_primary,
            secondary: formData.color_secondary,
            accent: formData.color_accent,
            dark_bg: formData.color_dark_bg,
            light_bg: formData.color_light_bg,
          },
          custom_colors: customColors,
        },
      };

      const res = await fetch(`/api/v1/brands/${currentBrand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSaveSuccess(true);
        if (refreshBrands) refreshBrands();
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update brand settings.");
      }
    } catch {
      alert("Network error. Failed to update brand settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Settings className="w-5 h-5 text-blue-600" />
              {currentBrand.name} Brand Settings
            </h1>
            <p className="text-xs text-gray-500">
              Manage brand identity, palette extractors, custom business types, and public preferences.
            </p>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Brand settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-8">
          {/* SECTION 1: GENERAL BRAND IDENTITY */}
          <div className="space-y-4">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              1. Brand Identity & Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Brand Display Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Legal Company Name</label>
                <input
                  type="text"
                  value={formData.legal_name}
                  onChange={(e) => setFormData({ ...formData, legal_name: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900"
                  placeholder="e.g. Virlio Technologies Inc."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Brand Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 resize-none"
                placeholder="Brief summary of your business mission and products..."
              />
            </div>
          </div>

          {/* SECTION 2: BRAND ASSET UPLOADERS (LOGO & BANNER) */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-indigo-600" />
              2. Brand Logo & Banner Assets
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-gray-800">Official Brand Logo</span>
                <SharedImageUploader
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  aspectRatio="square"
                  label=""
                  description="Square logo (Max 5MB)"
                />
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-gray-800">Cover Banner</span>
                <SharedImageUploader
                  value={formData.banner_url}
                  onChange={(url) => setFormData({ ...formData, banner_url: url })}
                  aspectRatio="banner"
                  label=""
                  description="Landscape header (Max 8MB)"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: CONTACT & COMMUNICATIONS */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-600" />
              3. Contact & Communications
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Business Contact Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="contact@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Support Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={formData.support_email}
                    onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                    placeholder="support@company.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Business Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 font-mono"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Business</label>
                <div className="relative">
                  <MessageSquare className="w-4 h-4 text-emerald-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={formData.whatsapp_phone}
                    onChange={(e) => setFormData({ ...formData, whatsapp_phone: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 font-mono"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: INDUSTRY & BUSINESS DROPDOWNS WITH CUSTOM ADD */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" />
              4. Business Profile & Region Selectors
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Business Type */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Business Type</label>
                {!customBTypeActive ? (
                  <select
                    value={formData.business_type}
                    onChange={(e) => {
                      if (e.target.value === "ADD_CUSTOM") {
                        setCustomBTypeActive(true);
                      } else {
                        setFormData({ ...formData, business_type: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {DEFAULT_BUSINESS_TYPES.map((bt) => (
                      <option key={bt} value={bt}>
                        {bt}
                      </option>
                    ))}
                    <option value="ADD_CUSTOM">+ Add Custom Business Type...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customBTypeValue}
                      onChange={(e) => setCustomBTypeValue(e.target.value)}
                      placeholder="Enter business type..."
                      className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl flex-1 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customBTypeValue.trim()) {
                          setFormData({ ...formData, business_type: customBTypeValue.trim() });
                          setCustomBTypeActive(false);
                        }
                      }}
                      className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomBTypeActive(false)}
                      className="px-2 py-2 text-xs font-medium bg-white text-gray-600 border rounded-xl"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Industry</label>
                {!customIndustryActive ? (
                  <select
                    value={formData.industry}
                    onChange={(e) => {
                      if (e.target.value === "ADD_CUSTOM") {
                        setCustomIndustryActive(true);
                      } else {
                        setFormData({ ...formData, industry: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {DEFAULT_INDUSTRIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                    <option value="ADD_CUSTOM">+ Add Custom Industry...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customIndustryValue}
                      onChange={(e) => setCustomIndustryValue(e.target.value)}
                      placeholder="Enter industry..."
                      className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl flex-1 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customIndustryValue.trim()) {
                          setFormData({ ...formData, industry: customIndustryValue.trim() });
                          setCustomIndustryActive(false);
                        }
                      }}
                      className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomIndustryActive(false)}
                      className="px-2 py-2 text-xs font-medium bg-white text-gray-600 border rounded-xl"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              {/* Sub Industry */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Sub Industry</label>
                <input
                  type="text"
                  value={formData.sub_industry}
                  onChange={(e) => setFormData({ ...formData, sub_industry: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900"
                  placeholder="e.g. B2B SaaS"
                />
              </div>

              {/* Country */}
              <div>
                <CountrySelect
                  label="Country"
                  value={formData.country}
                  onChange={(cName) => setFormData({ ...formData, country: cName })}
                />
              </div>

              {/* Language */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Language</label>
                {!customLanguageActive ? (
                  <select
                    value={formData.language}
                    onChange={(e) => {
                      if (e.target.value === "ADD_CUSTOM") {
                        setCustomLanguageActive(true);
                      } else {
                        setFormData({ ...formData, language: e.target.value });
                      }
                    }}
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                  >
                    {DEFAULT_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                    <option value="ADD_CUSTOM">+ Add Custom Language...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customLanguageValue}
                      onChange={(e) => setCustomLanguageValue(e.target.value)}
                      placeholder="Enter language..."
                      className="px-3 py-2 text-xs bg-white border border-gray-300 rounded-xl flex-1 text-gray-900"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (customLanguageValue.trim()) {
                          setFormData({ ...formData, language: customLanguageValue.trim() });
                          setCustomLanguageActive(false);
                        }
                      }}
                      className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomLanguageActive(false)}
                      className="px-2 py-2 text-xs font-medium bg-white text-gray-600 border rounded-xl"
                    >
                      X
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Official Website</label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900"
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: THEME COLORS & PALETTE IMAGE EXTRACTION */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <Palette className="w-4 h-4 text-pink-600" />
                5. Theme Colors, Swatches & Palette Image Extractor
              </h2>

              <div className="flex items-center gap-2">
                {formData.logo_url && (
                  <button
                    type="button"
                    onClick={() => runExtractFromImage(formData.logo_url)}
                    disabled={extractingColors}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 hover:bg-violet-100 border border-violet-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {extractingColors ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                    )}
                    <span>Extract from Logo</span>
                  </button>
                )}
              </div>
            </div>

            {/* PALETTE IMAGE UPLOADER */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-pink-600" /> Upload Color Palette / Moodboard Image to Extract
                </span>
                {formData.palette_image_url && (
                  <button
                    type="button"
                    onClick={() => runExtractFromImage(formData.palette_image_url)}
                    disabled={extractingColors}
                    className="text-xs font-bold text-pink-600 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Re-extract Swatches
                  </button>
                )}
              </div>

              <SharedImageUploader
                value={formData.palette_image_url}
                onChange={(url) => {
                  setFormData({ ...formData, palette_image_url: url });
                  if (url) runExtractFromImage(url);
                }}
                label=""
                description="Upload moodboard or palette swatch image to auto-populate hex codes"
                folder={`virlio/brands/${currentBrand.id}/palette`}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <BrandStyleSelect
                  value={formData.brand_style}
                  onChange={(style) => setFormData({ ...formData, brand_style: style })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Brand Voice / Tone</label>
                <select
                  value={formData.brand_voice}
                  onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
                >
                  {BRAND_TONES.map((tone) => (
                    <option key={tone} value={tone}>
                      {tone}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5 CORE COLOR TOKENS */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Primary Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.color_primary}
                    onChange={(e) => setFormData({ ...formData, color_primary: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color_primary}
                    onChange={(e) => setFormData({ ...formData, color_primary: e.target.value })}
                    className="w-full px-2 py-1.5 text-[11px] font-mono bg-white border border-gray-300 rounded-lg uppercase font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Secondary Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.color_secondary}
                    onChange={(e) => setFormData({ ...formData, color_secondary: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color_secondary}
                    onChange={(e) => setFormData({ ...formData, color_secondary: e.target.value })}
                    className="w-full px-2 py-1.5 text-[11px] font-mono bg-white border border-gray-300 rounded-lg uppercase font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Accent Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.color_accent}
                    onChange={(e) => setFormData({ ...formData, color_accent: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color_accent}
                    onChange={(e) => setFormData({ ...formData, color_accent: e.target.value })}
                    className="w-full px-2 py-1.5 text-[11px] font-mono bg-white border border-gray-300 rounded-lg uppercase font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Dark BG Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.color_dark_bg}
                    onChange={(e) => setFormData({ ...formData, color_dark_bg: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color_dark_bg}
                    onChange={(e) => setFormData({ ...formData, color_dark_bg: e.target.value })}
                    className="w-full px-2 py-1.5 text-[11px] font-mono bg-white border border-gray-300 rounded-lg uppercase font-bold text-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Light BG Color</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={formData.color_light_bg}
                    onChange={(e) => setFormData({ ...formData, color_light_bg: e.target.value })}
                    className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer shrink-0"
                  />
                  <input
                    type="text"
                    value={formData.color_light_bg}
                    onChange={(e) => setFormData({ ...formData, color_light_bg: e.target.value })}
                    className="w-full px-2 py-1.5 text-[11px] font-mono bg-white border border-gray-300 rounded-lg uppercase font-bold text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* CUSTOM COLOR TOKENS LIST & CREATOR */}
            <div className="pt-3 space-y-3">
              <label className="block text-xs font-bold text-gray-800">Custom Color Tokens</label>
              {customColors.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {customColors.map((ct, idx) => (
                    <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold">
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-300 shadow-2xs" style={{ backgroundColor: ct.hex }} />
                      <span className="font-bold text-gray-900">{ct.name}:</span>
                      <span className="font-mono text-gray-500">{ct.hex}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomColorToken(idx)}
                        className="text-gray-400 hover:text-red-600 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 max-w-md">
                <input
                  type="text"
                  value={newColorName}
                  onChange={(e) => setNewColorName(e.target.value)}
                  placeholder="Token Name (e.g. Brand Gold)..."
                  className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl flex-1 text-gray-900"
                />
                <input
                  type="color"
                  value={newColorHex}
                  onChange={(e) => setNewColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer shrink-0"
                />
                <button
                  type="button"
                  onClick={handleAddCustomColorToken}
                  className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Token</span>
                </button>
              </div>
            </div>
          </div>

          {/* SECTION 6: VISIBILITY & PREFERENCES */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h2 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <Eye className="w-4 h-4 text-amber-500" />
              6. Visibility & Community Permissions
            </h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_public_generation}
                  onChange={(e) => setFormData({ ...formData, allow_public_generation: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Allow Community Public Meme Generation</span>
                  <span className="text-[11px] text-gray-500 block">
                    Enables verified community creators to generate branded memes for {currentBrand.name}.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allow_public_profile}
                  onChange={(e) => setFormData({ ...formData, allow_public_profile: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded border-gray-300"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Public Brand Profile Page</span>
                  <span className="text-[11px] text-gray-500 block">
                    Displays public brand page at /brands/{currentBrand.slug} in the Virlio directory.
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200 flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Brand Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
