"use client";

import React, { useState } from "react";
import { Step3TargetAudience } from "@/lib/validations/brand-wizard";
import { AISuggestionBox } from "../ai-suggestion-box";
import { CountrySelect } from "@/components/ui/country-select";
import { Users, Globe, Languages, Tag, Plus, X, Sparkles } from "lucide-react";

interface Step3Props {
  data: Step3TargetAudience;
  onChange: (updated: Partial<Step3TargetAudience>) => void;
  brandContext: Record<string, any>;
  errors?: Record<string, string>;
}

const AGE_GROUPS = ["13-17", "18-24", "25-34", "35-44", "45-54", "55-64", "65+"];
const CUSTOMER_TYPES = ["B2C (Consumer)", "B2B (Business)", "D2C (Direct to Consumer)", "Hybrid", "Enterprise"];

export function Step3AudienceComponent({ data, onChange, brandContext, errors = {} }: Step3Props) {
  const [interestInput, setInterestInput] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [generatingTags, setGeneratingTags] = useState(false);

  const toggleAgeGroup = (age: string) => {
    const current = data.target_age_groups || [];
    if (current.includes(age)) {
      onChange({ target_age_groups: current.filter((a) => a !== age) });
    } else {
      onChange({ target_age_groups: [...current, age] });
    }
  };

  const handleAddInterestWithCommaSplit = (rawText: string) => {
    if (!rawText || !rawText.trim()) return;
    const current = data.audience_interests || [];
    if (current.length >= 25) return;

    const newTags = rawText
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    if (newTags.length > 0) {
      const updated = Array.from(new Set([...current, ...newTags])).slice(0, 25);
      onChange({ audience_interests: updated });
    }
    setInterestInput("");
  };

  const handleInterestInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      handleAddInterestWithCommaSplit(val);
    } else {
      setInterestInput(val);
    }
  };

  const removeInterest = (item: string) => {
    onChange({ audience_interests: (data.audience_interests || []).filter((i) => i !== item) });
  };

  const handleGenerateTagsWithAI = async () => {
    const current = data.audience_interests || [];
    if (current.length >= 25) return;

    setGeneratingTags(true);
    try {
      const res = await fetch("/api/v1/brands/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: 3,
          field: "audienceInterests",
          currentValue: current.join(", "),
          brandContext,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data?.suggestion) {
        const rawTags = json.data.suggestion;
        const newTags = rawTags
          .split(/[,;]/)
          .map((s: string) => s.replace(/^(and|or|including|with)\s+/i, "").trim())
          .filter((s: string) => s.length >= 2 && s.length <= 32);

        if (newTags.length > 0) {
          const updated = Array.from(new Set([...current, ...newTags])).slice(0, 25);
          onChange({ audience_interests: updated });
        }
      }
    } catch (err) {
      console.error("Failed to generate interest tags with AI", err);
    } finally {
      setGeneratingTags(false);
    }
  };

  const handleCountrySelect = (countryName: string) => {
    if (!countryName) return;
    const current = data.target_countries || [];
    if (!current.includes(countryName)) {
      onChange({ target_countries: [...current, countryName] });
    }
  };

  const removeCountry = (item: string) => {
    onChange({ target_countries: (data.target_countries || []).filter((c) => c !== item) });
  };

  const addLanguage = () => {
    if (!languageInput.trim()) return;
    const newLangs = languageInput.split(",").map((s) => s.trim()).filter(Boolean);
    if (newLangs.length > 0) {
      const current = data.target_languages || [];
      onChange({ target_languages: Array.from(new Set([...current, ...newLangs])) });
    }
    setLanguageInput("");
  };

  const removeLanguage = (item: string) => {
    onChange({ target_languages: (data.target_languages || []).filter((l) => l !== item) });
  };

  const currentInterestCount = (data.audience_interests || []).length;
  const isMaxTagsReached = currentInterestCount >= 25;

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Step 3: Target Audience & Segments
        </h2>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Define who your primary customers are. AI suggests audience expansions and potential customer segments.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
          Customer Model *
        </label>
        <select
          value={data.customer_type}
          onChange={(e) => onChange({ customer_type: e.target.value })}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 shadow-xs"
        >
          {CUSTOMER_TYPES.map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Target Age Groups *
        </label>
        <div className="flex flex-wrap gap-2">
          {AGE_GROUPS.map((age) => {
            const selected = (data.target_age_groups || []).includes(age);
            return (
              <button
                key={age}
                type="button"
                onClick={() => toggleAgeGroup(age)}
                className={`px-3.5 py-1 text-xs font-semibold rounded-full border transition-colors ${
                  selected
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {age} yrs
              </button>
            );
          })}
        </div>
      </div>

      {/* Rich Multi-Paragraph Audience Profile Description Field */}
      <AISuggestionBox
        step={3}
        field="audienceDescription"
        label="Audience Profile & Interests Description"
        placeholder="Describe your target audience profile, psychographic traits, and core customer demographics..."
        multiline
        rows={4}
        currentValue={data.audience_description || ""}
        brandContext={brandContext}
        onAccept={(val) => onChange({ audience_description: val })}
        helperText="AI generates a rich, multi-sentence demographic & psychographic target audience description."
      />

      {/* Audience Interest Tags with Max 25 Enforced */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-gray-500" />
            Audience Interest Tags
            <span className={`text-xs font-normal ${isMaxTagsReached ? "text-amber-600 font-semibold" : "text-gray-500"}`}>
              ({currentInterestCount} / 25 max)
            </span>
          </label>
          <button
            type="button"
            onClick={handleGenerateTagsWithAI}
            disabled={generatingTags || isMaxTagsReached}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${generatingTags ? "animate-spin" : ""}`} />
            {generatingTags ? "Generating Tags..." : isMaxTagsReached ? "Max Tags Reached" : "Generate Tags with AI"}
          </button>
        </div>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={interestInput}
            onChange={handleInterestInputChange}
            disabled={isMaxTagsReached}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddInterestWithCommaSplit(interestInput);
              }
            }}
            placeholder={isMaxTagsReached ? "Maximum 25 tags reached" : "Type interest tags (comma separated, e.g. Gamer, Software, Creators) and press Enter"}
            className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={() => handleAddInterestWithCommaSplit(interestInput)}
            disabled={isMaxTagsReached || !interestInput.trim()}
            className="px-4 py-2.5 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {(data.audience_interests || []).map((interest) => (
            <span
              key={interest}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
            >
              {interest}
              <button
                type="button"
                onClick={() => removeInterest(interest)}
                className="text-blue-500 hover:text-red-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Searchable CountrySelect Dropdown */}
        <div className="space-y-2">
          <CountrySelect
            id="field-target-countries"
            label="Target Countries *"
            value=""
            placeholder="Search & select target country..."
            onChange={(selectedName) => handleCountrySelect(selectedName)}
          />
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(data.target_countries || []).map((c) => (
              <span key={c} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
                {c}
                <button type="button" onClick={() => removeCountry(c)} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-gray-500" />
            Languages Spoken *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={languageInput}
              onChange={(e) => setLanguageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLanguage();
                }
              }}
              placeholder="e.g. English, Urdu, Spanish (comma separated)"
              className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 placeholder-gray-400 shadow-xs"
            />
            <button
              type="button"
              onClick={addLanguage}
              className="px-4 py-2.5 text-sm font-bold bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {(data.target_languages || []).map((l) => (
              <span key={l} className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-lg border border-gray-200">
                {l}
                <button type="button" onClick={() => removeLanguage(l)} className="hover:text-red-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
