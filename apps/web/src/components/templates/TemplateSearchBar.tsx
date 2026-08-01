"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";

interface TemplateSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function TemplateSearchBar({
  value,
  onChange,
  placeholder = "Search templates...",
  className = "",
}: TemplateSearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape" && value) {
      onChange("");
    }
  };

  return (
    <div
      className={`relative flex items-center w-full transition-all rounded-2xl bg-white border border-gray-200 focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 ${className}`}
    >
      <div className="pl-4 pr-2 flex items-center pointer-events-none text-gray-400">
        <Search className="w-5 h-5 shrink-0" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        aria-label="Search templates"
        className="w-full py-3.5 pr-10 text-sm sm:text-base text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-3.5 p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          title="Clear search"
          aria-label="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
