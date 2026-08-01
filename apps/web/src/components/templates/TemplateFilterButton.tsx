"use client";

import React from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

interface TemplateFilterButtonProps {
  activeCount: number;
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function TemplateFilterButton({
  activeCount,
  isOpen,
  onClick,
  className = "",
}: TemplateFilterButtonProps) {
  const hasActiveFilters = activeCount > 0;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={isOpen}
      aria-haspopup="dialog"
      aria-label={hasActiveFilters ? `Filter (${activeCount} active)` : "Filter"}
      className={`inline-flex items-center justify-center gap-2.5 px-5 py-3.5 text-sm sm:text-base font-semibold rounded-2xl border transition-all shrink-0 select-none ${
        hasActiveFilters
          ? "bg-blue-600 text-white border-blue-600 shadow-xs hover:bg-blue-700"
          : isOpen
          ? "bg-gray-100 text-gray-900 border-gray-300"
          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300"
      } ${className}`}
    >
      <SlidersHorizontal className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
      <span>Filter</span>

      {hasActiveFilters && (
        <span
          className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold rounded-full ${
            hasActiveFilters ? "bg-white text-blue-700" : "bg-gray-200 text-gray-700"
          }`}
        >
          {activeCount}
        </span>
      )}

      <ChevronDown
        className={`w-4 h-4 shrink-0 transition-transform duration-200 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
  );
}
