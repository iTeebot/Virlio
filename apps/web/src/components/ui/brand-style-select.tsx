"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, Sparkle, Plus } from "lucide-react";
import { validateSafetyAndProfanity, normalizeTaxonomyName } from "@/lib/validations/brand-taxonomy";

export const PREDEFINED_BRAND_STYLES = [
  "Modern",
  "Minimal",
  "Corporate",
  "Luxury",
  "Elegant",
  "Professional",
  "Friendly",
  "Bold",
  "Creative",
  "Technical",
  "Premium",
  "Playful",
  "Vintage",
  "Futuristic",
  "Organic",
  "Handcrafted",
  "Street",
  "Traditional",
];

interface BrandStyleSelectProps {
  value: string;
  onChange: (style: string) => void;
  label?: string;
  error?: string;
  id?: string;
}

export function BrandStyleSelect({
  value,
  onChange,
  label = "Brand Style",
  error,
  id = "brand-style-select",
}: BrandStyleSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);

  // Custom style state
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [customError, setCustomError] = useState<string | null>(null);
  const [submittingCustom, setSubmittingCustom] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredStyles = useMemo(() => {
    if (!search.trim()) return PREDEFINED_BRAND_STYLES;
    const q = search.toLowerCase().trim();
    return PREDEFINED_BRAND_STYLES.filter((s) => s.toLowerCase().includes(q));
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && !isAddingCustom) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
      setFocusedIndex(0);
    }
  }, [isOpen, isAddingCustom]);

  const handleSelect = (s: string) => {
    onChange(s);
    setIsOpen(false);
  };

  const handleAddCustom = async () => {
    setCustomError(null);
    const check = validateSafetyAndProfanity(customInput);
    if (!check.isValid) {
      setCustomError(check.reason || "Invalid brand style entry.");
      return;
    }

    setSubmittingCustom(true);
    try {
      const res = await fetch("/api/v1/brands/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "brand_style",
          name: customInput,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        const normalized = json.data.name;
        onChange(normalized);
        setIsAddingCustom(false);
        setCustomInput("");
        setIsOpen(false);
      } else {
        setCustomError(json.message || "Failed to submit custom style.");
      }
    } catch (err: any) {
      setCustomError(err.message || "Network error");
    } finally {
      setSubmittingCustom(false);
    }
  };

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <Sparkle className="w-4 h-4 text-gray-500" />
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 shadow-xs transition-colors ${
          error ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-600"
        }`}
      >
        <span className="font-medium text-gray-900">{value || "Select Brand Style..."}</span>
        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
      </button>

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}

      {/* Popup Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-72 flex flex-col">
          {!isAddingCustom ? (
            <>
              <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search brand style..."
                  className="w-full py-1.5 px-2 text-xs bg-transparent border-0 text-gray-900 focus:outline-none placeholder-gray-400"
                />
              </div>

              <div className="overflow-y-auto py-1 divide-y divide-gray-50 flex-1">
                {filteredStyles.map((s, idx) => {
                  const isSelected = value.toLowerCase() === s.toLowerCase();
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSelect(s)}
                      className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                        idx === focusedIndex ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50 text-gray-800"
                      }`}
                    >
                      <span>{s}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors text-left"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Add Custom Style...
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 space-y-3 bg-gray-50">
              <span className="text-xs font-bold text-gray-900 block">Add Custom Brand Style</span>
              <input
                type="text"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                placeholder="e.g. Cyberpunk, Minimalist Tech..."
                className="w-full px-3 py-2 text-xs bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              {customError && <p className="text-xs text-red-600 font-medium">{customError}</p>}
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddCustom}
                  disabled={submittingCustom}
                  className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingCustom ? "Adding..." : "Add Style"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
