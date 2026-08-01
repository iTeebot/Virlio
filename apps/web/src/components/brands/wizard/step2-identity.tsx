"use client";

import React, { useState, useEffect } from "react";
import { Step2BrandIdentity } from "@/lib/validations/brand-wizard";
import { SharedImageUploader } from "@/components/brands/shared-image-uploader";
import { BrandStyleSelect } from "@/components/ui/brand-style-select";
import { extractColorsFromImage } from "@/lib/utils/color-extractor";
import { validateSafetyAndProfanity, normalizeTitleCase } from "@/lib/validations/safety-filter";
import { Palette, Sparkles, Check, Type, Sparkle, AlertTriangle, Plus, X, Trash2, Image as ImageIcon } from "lucide-react";

interface Step2Props {
  data: Step2BrandIdentity;
  onChange: (updated: Partial<Step2BrandIdentity>) => void;
  brandContext: Record<string, any>;
  errors?: Record<string, string>;
}

const DEFAULT_PERSONALITY_OPTIONS = [
  "Professional",
  "Funny",
  "Luxury",
  "Minimal",
  "Modern",
  "Corporate",
  "Bold",
  "Friendly",
  "Playful",
  "Technical",
  "Educational",
  "Premium",
];

const FONTS = [
  "Inter",
  "Roboto",
  "Outfit",
  "Space Grotesk",
  "Plus Jakarta Sans",
  "Playfair Display",
  "Rubik",
  "Georgia",
  "Cinzel",
];

export function Step2IdentityComponent({ data, onChange, brandContext, errors = {} }: Step2Props) {
  const [extractingTarget, setExtractingTarget] = useState<"logo" | "palette" | null>(null);
  const [isColorEditedManually, setIsColorEditedManually] = useState(false);
  const [showRegenPrompt, setShowRegenPrompt] = useState(false);

  // Personality Traits State
  const [personalityOptions, setPersonalityOptions] = useState<string[]>(DEFAULT_PERSONALITY_OPTIONS);
  const [isAddingTrait, setIsAddingTrait] = useState(false);
  const [customTraitInput, setCustomTraitInput] = useState("");
  const [traitError, setTraitError] = useState<string | null>(null);
  const [submittingTrait, setSubmittingTrait] = useState(false);

  // Custom Color Token State
  const [isAddingColorToken, setIsAddingColorToken] = useState(false);
  const [customColorName, setCustomColorName] = useState("");
  const [customColorHex, setCustomColorHex] = useState("#3B82F6");
  const [colorTokenError, setColorTokenError] = useState<string | null>(null);

  // Fetch approved & user-submitted custom personality traits from database taxonomy
  useEffect(() => {
    async function loadCustomTraits() {
      try {
        const res = await fetch("/api/v1/brands/taxonomy?category=personality_trait");
        if (res.ok) {
          const json = await res.json();
          if (json.data && Array.isArray(json.data)) {
            const dbTraits = json.data.map((item: any) => item.name);
            setPersonalityOptions((prev) => Array.from(new Set([...prev, ...dbTraits])));
          }
        }
      } catch (err) {
        console.error("Failed to load custom traits", err);
      }
    }
    loadCustomTraits();
  }, []);

  // Extract colors from specified target ("logo" or "palette")
  const runAutoColorExtraction = async (imageUrl: string, target: "logo" | "palette") => {
    if (!imageUrl) return;
    setExtractingTarget(target);
    try {
      const palette = await extractColorsFromImage(imageUrl);
      onChange({
        primary_color: palette.primary,
        secondary_color: palette.secondary,
        accent_color: palette.accent,
        dark_bg_color: palette.darkBackground,
        light_bg_color: palette.lightBackground,
      });
      setIsColorEditedManually(false);
    } catch (err) {
      console.error(`Color extraction error for ${target}`, err);
    } finally {
      setExtractingTarget(null);
    }
  };

  const handleLogoChange = (newUrl: string) => {
    if (newUrl && newUrl !== data.logo_url) {
      if (isColorEditedManually) {
        setShowRegenPrompt(true);
      } else {
        runAutoColorExtraction(newUrl, "logo");
      }
    }
    onChange({ logo_url: newUrl });
  };

  const handlePaletteImageChange = (newUrl: string) => {
    onChange({ palette_image_url: newUrl });
    if (newUrl) {
      runAutoColorExtraction(newUrl, "palette");
    }
  };

  const togglePersonality = (p: string) => {
    const current = data.brand_personality || [];
    if (current.includes(p)) {
      onChange({ brand_personality: current.filter((item) => item !== p) });
    } else {
      onChange({ brand_personality: [...current, p] });
    }
  };

  const handleAddCustomTrait = async () => {
    setTraitError(null);
    const check = validateSafetyAndProfanity(customTraitInput);
    if (!check.isValid) {
      setTraitError(check.reason || "Invalid personality trait.");
      return;
    }

    const normalized = normalizeTitleCase(customTraitInput);
    setSubmittingTrait(true);

    try {
      const res = await fetch("/api/v1/brands/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "personality_trait", name: normalized }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const addedName = json.data.name;
        setPersonalityOptions((prev) => Array.from(new Set([...prev, addedName])));
        togglePersonality(addedName);
        setCustomTraitInput("");
        setIsAddingTrait(false);
      } else {
        setTraitError(json.message || "Failed to submit custom trait.");
      }
    } catch (err: any) {
      setTraitError(err.message || "Network error");
    } finally {
      setSubmittingTrait(false);
    }
  };

  // Add Custom Color Token with NSFW Safety Validation
  const handleAddCustomColorToken = () => {
    setColorTokenError(null);
    const check = validateSafetyAndProfanity(customColorName);
    if (!check.isValid) {
      setColorTokenError(check.reason || "Invalid color token name.");
      return;
    }

    const normalizedName = normalizeTitleCase(customColorName);
    const currentCustoms = data.custom_colors || [];

    if (currentCustoms.some((c) => c.name.toLowerCase() === normalizedName.toLowerCase())) {
      setColorTokenError("A color token with this name already exists.");
      return;
    }

    onChange({
      custom_colors: [...currentCustoms, { name: normalizedName, hex: customColorHex }],
    });

    setCustomColorName("");
    setCustomColorHex("#3B82F6");
    setIsAddingColorToken(false);
  };

  const handleRemoveCustomColor = (tokenName: string) => {
    onChange({
      custom_colors: (data.custom_colors || []).filter((c) => c.name !== tokenName),
    });
  };

  const handleUpdateCustomColorHex = (tokenName: string, newHex: string) => {
    setIsColorEditedManually(true);
    onChange({
      custom_colors: (data.custom_colors || []).map((c) => (c.name === tokenName ? { ...c, hex: newHex } : c)),
    });
  };

  const handleManualColorChange = (key: keyof Step2BrandIdentity, val: string) => {
    setIsColorEditedManually(true);
    onChange({ [key]: val });
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-600" />
            Step 2: Visual Identity & Color System
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Upload your logo or brand palette image to extract colors, define tokens, and set typography.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {data.logo_url && (
            <button
              type="button"
              onClick={() => runAutoColorExtraction(data.logo_url, "logo")}
              disabled={extractingTarget !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${extractingTarget === "logo" ? "animate-spin" : ""}`} />
              {extractingTarget === "logo" ? "Extracting..." : "Regenerate from Logo"}
            </button>
          )}

          {data.palette_image_url && (
            <button
              type="button"
              onClick={() => runAutoColorExtraction(data.palette_image_url!, "palette")}
              disabled={extractingTarget !== null}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors disabled:opacity-50"
            >
              <ImageIcon className={`w-3.5 h-3.5 ${extractingTarget === "palette" ? "animate-spin" : ""}`} />
              {extractingTarget === "palette" ? "Extracting..." : "Regenerate from Palette Image"}
            </button>
          )}
        </div>
      </div>

      {/* Logo Update Palette Prompt Modal */}
      {showRegenPrompt && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-amber-900">Logo Image Updated</h4>
              <p className="text-xs text-amber-800">Would you like to replace your custom colors with a palette extracted from the new logo?</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                runAutoColorExtraction(data.logo_url, "logo");
                setShowRegenPrompt(false);
              }}
              className="px-3 py-1 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
              Regenerate Palette
            </button>
            <button
              type="button"
              onClick={() => setShowRegenPrompt(false)}
              className="px-3 py-1 text-xs font-semibold bg-white text-gray-700 border border-gray-200 rounded-lg"
            >
              Keep Existing Colors
            </button>
          </div>
        </div>
      )}

      {/* Asset Uploads: Logo & Cover Banner via Universal SharedImageUploader */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Logo Upload */}
        <SharedImageUploader
          label="Brand Logo *"
          value={data.logo_url}
          onChange={handleLogoChange}
          folder="virlio/brand-logos"
          aspectRatio="square"
          description="Upload your official logo (Drag & Drop, device upload, or URL). Colors will be extracted automatically."
        />

        {/* Cover Banner Upload */}
        <SharedImageUploader
          label="Cover Banner Image (Optional)"
          value={data.banner_url || ""}
          onChange={(url) => onChange({ banner_url: url })}
          folder="virlio/brand-banners"
          aspectRatio="banner"
          description="Header banner used for public brand profile & social cards."
        />
      </div>

      {/* Extracted Solid Brand Colors & Swatches Section */}
      <div className="p-5 bg-gray-50/80 border border-gray-200 rounded-2xl space-y-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Palette className="w-4 h-4 text-blue-600" />
              Extracted Solid Brand Colors & Custom Tokens
            </h3>
            <p className="text-xs text-gray-500">
              {isColorEditedManually
                ? "Customized palette. Click any color swatch to adjust hex values."
                : "Automatically generated from your logo or palette image. Click any swatch to adjust."}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isAddingColorToken && (
              <button
                type="button"
                onClick={() => setIsAddingColorToken(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-white text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" /> + Add Custom Field
              </button>
            )}
          </div>
        </div>

        {/* Optional Palette Image Upload Component */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-900">Upload Brand Palette Image / Style Guide (Optional)</span>
            {data.palette_image_url && (
              <button
                type="button"
                onClick={() => runAutoColorExtraction(data.palette_image_url!, "palette")}
                disabled={extractingTarget !== null}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 disabled:opacity-50"
              >
                <ImageIcon className={`w-3.5 h-3.5 ${extractingTarget === "palette" ? "animate-spin" : ""}`} />
                {extractingTarget === "palette" ? "Extracting..." : "Regenerate from Palette Image"}
              </button>
            )}
          </div>
          <SharedImageUploader
            value={data.palette_image_url || ""}
            onChange={handlePaletteImageChange}
            folder="virlio/brand-palettes"
            aspectRatio="square"
            description="Upload a color palette graphic to extract colors directly into your brand swatches."
          />
        </div>

        {/* Add Custom Color Token Form */}
        {isAddingColorToken && (
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
            <span className="text-xs font-bold text-blue-900">Add Custom Color Field</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={customColorName}
                onChange={(e) => setCustomColorName(e.target.value)}
                placeholder="Field Name (e.g. Background Surface, Card Glow)"
                className="px-3 py-2 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={customColorHex}
                  onChange={(e) => setCustomColorHex(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg uppercase font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddCustomColorToken}
                  disabled={!customColorName.trim()}
                  className="px-3 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add Field
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingColorToken(false);
                    setColorTokenError(null);
                  }}
                  className="px-3 py-2 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
            {colorTokenError && <p className="text-xs text-red-600 font-semibold">{colorTokenError}</p>}
          </div>
        )}

        {/* Color Swatches Grid (Default 5 + Custom Fields) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Primary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.primary_color}
                onChange={(e) => handleManualColorChange("primary_color", e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.primary_color}
                onChange={(e) => handleManualColorChange("primary_color", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Secondary Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.secondary_color}
                onChange={(e) => handleManualColorChange("secondary_color", e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.secondary_color}
                onChange={(e) => handleManualColorChange("secondary_color", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Accent Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.accent_color}
                onChange={(e) => handleManualColorChange("accent_color", e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.accent_color}
                onChange={(e) => handleManualColorChange("accent_color", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Dark Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.dark_bg_color}
                onChange={(e) => handleManualColorChange("dark_bg_color", e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.dark_bg_color}
                onChange={(e) => handleManualColorChange("dark_bg_color", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Light Background</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={data.light_bg_color}
                onChange={(e) => handleManualColorChange("light_bg_color", e.target.value)}
                className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
              />
              <input
                type="text"
                value={data.light_bg_color}
                onChange={(e) => handleManualColorChange("light_bg_color", e.target.value)}
                className="w-full px-2 py-1 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg uppercase font-mono"
              />
            </div>
          </div>

          {/* User-Added Custom Color Fields */}
          {(data.custom_colors || []).map((token) => (
            <div key={token.name} className="relative group">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-gray-700 truncate max-w-[100px]" title={token.name}>
                  {token.name}
                </label>
                <button
                  type="button"
                  onClick={() => handleRemoveCustomColor(token.name)}
                  className="text-gray-400 hover:text-red-600"
                  title="Remove custom field"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={token.hex}
                  onChange={(e) => handleUpdateCustomColorHex(token.name, e.target.value)}
                  className="w-8 h-8 rounded-lg bg-transparent border-0 cursor-pointer"
                />
                <input
                  type="text"
                  value={token.hex}
                  onChange={(e) => handleUpdateCustomColorHex(token.name, e.target.value)}
                  className="w-full px-2 py-1 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg uppercase font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Typography & Searchable Brand Style Select */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="field-typography" className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Type className="w-4 h-4 text-gray-500" />
            Brand Typography *
          </label>
          <select
            id="field-typography"
            value={data.typography}
            onChange={(e) => onChange({ typography: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
          >
            {FONTS.map((font) => (
              <option key={font} value={font}>
                {font}
              </option>
            ))}
          </select>
        </div>

        {/* Searchable BrandStyleSelect with Custom Taxonomy Support */}
        <div>
          <BrandStyleSelect
            id="field-brand_style"
            label="Brand Style *"
            value={data.brand_style}
            onChange={(style) => onChange({ brand_style: style })}
            error={errors.brand_style}
          />
        </div>
      </div>

      {/* Brand Personality Tags with Custom Trait Addition & Moderation Taxonomy */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-800">
            Brand Personality Traits (Select all that apply)
          </label>
          {!isAddingTrait && (
            <button
              type="button"
              onClick={() => setIsAddingTrait(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-3.5 h-3.5" /> + Add Custom Trait
            </button>
          )}
        </div>

        {/* Custom Trait Input Form */}
        {isAddingTrait && (
          <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
            <span className="text-xs font-bold text-blue-900">Suggest Custom Personality Trait</span>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTraitInput}
                onChange={(e) => setCustomTraitInput(e.target.value)}
                placeholder="e.g. Energetic, Empathetic, Rebellious..."
                className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleAddCustomTrait}
                disabled={submittingTrait || !customTraitInput.trim()}
                className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingTrait ? "Saving..." : "Add & Select"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingTrait(false);
                  setTraitError(null);
                }}
                className="px-2.5 py-1.5 text-xs font-medium bg-white text-gray-600 border border-gray-200 rounded-lg"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            {traitError && <p className="text-xs text-red-600 font-semibold">{traitError}</p>}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {personalityOptions.map((p) => {
            const selected = (data.brand_personality || []).includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => togglePersonality(p)}
                className={`px-3 py-1 text-xs font-semibold rounded-full border transition-colors ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
