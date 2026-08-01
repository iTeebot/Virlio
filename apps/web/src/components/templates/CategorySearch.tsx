"use client";

import React, { useRef } from "react";
import { Search, X } from "lucide-react";

interface CategorySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function CategorySearch({
  value,
  onChange,
  placeholder = "Search categories...",
}: CategorySearchProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative flex items-center w-full rounded-xl bg-gray-50 border border-gray-200 focus-within:border-blue-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 transition-all">
      <div className="pl-3 pr-2 flex items-center pointer-events-none text-gray-400">
        <Search className="w-4 h-4 shrink-0" />
      </div>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label="Search category list"
        className="w-full py-2 pr-8 text-xs sm:text-sm text-gray-900 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0"
      />

      {value && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            inputRef.current?.focus();
          }}
          className="absolute right-2 p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-200 transition-colors"
          aria-label="Clear category search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
