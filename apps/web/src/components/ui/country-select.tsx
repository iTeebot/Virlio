"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { Search, ChevronDown, Check, Globe } from "lucide-react";

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
}

export const COUNTRIES: CountryOption[] = [
  { code: "PK", name: "Pakistan", flag: "🇵🇰" },
  { code: "US", name: "United States", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IN", name: "India", flag: "🇮🇳" },
  { code: "DE", name: "Germany", flag: "🇩🇪" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "AU", name: "Australia", flag: "🇦🇺" },
  { code: "SG", name: "Singapore", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾" },
  { code: "TR", name: "Turkey", flag: "🇹🇷" },
  { code: "QA", name: "Qatar", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼" },
  { code: "OM", name: "Oman", flag: "🇴🇲" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭" },
  { code: "EG", name: "Egypt", flag: "🇪🇬" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "SE", name: "Sweden", flag: "🇸🇪 font" },
  { code: "NO", name: "Norway", flag: "🇳🇴" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭" },
  { code: "ES", name: "Spain", flag: "🇪🇸" },
  { code: "IT", name: "Italy", flag: "🇮🇹" },
  { code: "BR", name: "Brazil", flag: "🇧🇷" },
  { code: "JP", name: "Japan", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", flag: "🇰🇷" },
  { code: "CN", name: "China", flag: "🇨🇳" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿" },
  { code: "IE", name: "Ireland", flag: "🇮🇪" },
  { code: "MX", name: "Mexico", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", flag: "🇦🇷" },
  { code: "NG", name: "Nigeria", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", flag: "🇰🇪" },
  { code: "GLOBAL", name: "Global / Worldwide", flag: "🌐" },
];

interface CountrySelectProps {
  value: string;
  onChange: (value: string, country?: CountryOption) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  id?: string;
}

export function CountrySelect({
  value,
  onChange,
  label,
  error,
  placeholder = "Select or search country...",
  id = "country-select",
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Find currently selected country by code or name
  const selectedCountry = useMemo(() => {
    if (!value) return null;
    return COUNTRIES.find((c) => c.code.toLowerCase() === value.toLowerCase() || c.name.toLowerCase() === value.toLowerCase());
  }, [value]);

  // Filter countries based on search input
  const filteredCountries = useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.toLowerCase().trim();
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q));
  }, [search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearch("");
      setFocusedIndex(0);
    }
  }, [isOpen]);

  const handleSelect = (c: CountryOption) => {
    onChange(c.name, c);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown" || e.key === " ") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.min(prev + 1, filteredCountries.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredCountries[focusedIndex]) {
        handleSelect(filteredCountries[focusedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative space-y-1.5" ref={containerRef}>
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
          <Globe className="w-4 h-4 text-gray-500" />
          {label}
        </label>
      )}

      <button
        id={id}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 text-sm bg-white border text-gray-900 rounded-xl focus:outline-none focus:ring-2 shadow-xs transition-colors ${
          error ? "border-red-500 focus:ring-red-500/20" : "border-gray-300 focus:ring-blue-500/20 focus:border-blue-600"
        }`}
      >
        <span className="flex items-center gap-2 font-medium">
          {selectedCountry ? (
            <>
              <span>{selectedCountry.flag}</span>
              <span>{selectedCountry.name}</span>
            </>
          ) : (
            <span className="text-gray-400">{value || placeholder}</span>
          )}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-500 shrink-0" />
      </button>

      {error && <p className="text-xs text-red-600 font-medium mt-1">{error}</p>}

      {/* Searchable Dropdown Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden max-h-64 flex flex-col">
          {/* Search Box Header */}
          <div className="p-2 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
            <Search className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setFocusedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search country..."
              className="w-full py-1.5 px-2 text-xs bg-transparent border-0 text-gray-900 focus:outline-none placeholder-gray-400"
            />
          </div>

          {/* List of Countries */}
          <div className="overflow-y-auto py-1 divide-y divide-gray-50">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-500">No countries found</div>
            ) : (
              filteredCountries.map((c, idx) => {
                const isSelected = selectedCountry?.code === c.code || value.toLowerCase() === c.name.toLowerCase();
                const isFocused = idx === focusedIndex;

                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-left transition-colors ${
                      isFocused ? "bg-blue-50 text-blue-900" : "hover:bg-gray-50 text-gray-800"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-sm">{c.flag}</span>
                      <span>{c.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">({c.code})</span>
                    </span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-blue-600" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
