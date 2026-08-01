"use client";

import React from "react";
import { Check, Square, CheckSquare } from "lucide-react";
import { CategoryItem } from "./types";

interface CategorySelectorProps {
  categories: CategoryItem[];
  selectedCategories: string[]; // List of selected category slugs
  onToggleCategory: (slug: string) => void;
  searchQuery: string;
}

export function CategorySelector({
  categories,
  selectedCategories,
  onToggleCategory,
  searchQuery,
}: CategorySelectorProps) {
  // Client-side local instant search filtering on category name/description/slug
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase().trim();
    return categories.filter(
      (cat) =>
        cat.name.toLowerCase().includes(q) ||
        cat.slug.toLowerCase().includes(q) ||
        (cat.description && cat.description.toLowerCase().includes(q))
    );
  }, [categories, searchQuery]);

  if (filteredCategories.length === 0) {
    return (
      <div className="py-8 text-center px-4">
        <p className="text-xs text-gray-500 font-medium">
          No categories match &quot;{searchQuery}&quot;
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 pr-1" role="group" aria-label="Category List">
      {filteredCategories.map((cat) => {
        const isSelected = selectedCategories.includes(cat.slug.toLowerCase());

        return (
          <button
            key={cat.slug}
            type="button"
            onClick={() => onToggleCategory(cat.slug.toLowerCase())}
            aria-pressed={isSelected}
            className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all border ${
              isSelected
                ? "bg-blue-50/80 border-blue-200 text-blue-900"
                : "bg-white border-transparent hover:bg-gray-50 text-gray-700 hover:border-gray-200"
            }`}
          >
            {/* Custom Checkbox Indicator */}
            <div
              className={`mt-0.5 shrink-0 flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                isSelected
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 bg-white"
              }`}
            >
              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
            </div>

            {/* Category Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-xs font-semibold line-clamp-1 ${
                    isSelected ? "text-blue-900" : "text-gray-800"
                  }`}
                >
                  {cat.name}
                </span>

                {cat.count !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                      isSelected
                        ? "bg-blue-100 text-blue-700 border-blue-200"
                        : "bg-gray-100 text-gray-500 border-gray-200"
                    }`}
                  >
                    {cat.count}
                  </span>
                )}
              </div>

              {cat.description && (
                <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                  {cat.description}
                </p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
