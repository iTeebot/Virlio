"use client";

import React from "react";
import { RotateCcw, Check } from "lucide-react";

interface FilterFooterProps {
  onClearAll: () => void;
  onApply: () => void;
  onCancel?: () => void;
  hasSelections: boolean;
  activeSelectionCount?: number;
}

export function FilterFooter({
  onClearAll,
  onApply,
  onCancel,
  hasSelections,
  activeSelectionCount = 0,
}: FilterFooterProps) {
  return (
    <div className="p-3 sm:p-4 border-t border-gray-100 bg-white rounded-b-2xl flex items-center justify-between gap-3 shrink-0">
      <button
        type="button"
        onClick={onClearAll}
        disabled={!hasSelections}
        className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors ${
          hasSelections
            ? "text-gray-600 hover:text-red-600 hover:bg-red-50"
            : "text-gray-300 cursor-not-allowed"
        }`}
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Clear All</span>
      </button>

      <div className="flex items-center gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
        )}

        <button
          type="button"
          onClick={onApply}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-xs transition-colors"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
          <span>Apply Filters{activeSelectionCount > 0 ? ` (${activeSelectionCount})` : ""}</span>
        </button>
      </div>
    </div>
  );
}
