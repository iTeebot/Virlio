"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, SlidersHorizontal } from "lucide-react";
import { CategoryItem, TemplateFilterState } from "./types";
import { CategorySearch } from "./CategorySearch";
import { CategorySelector } from "./CategorySelector";
import { FilterFooter } from "./FilterFooter";

interface TemplateFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CategoryItem[];
  filterState: TemplateFilterState;
  onApplyFilters: (newState: TemplateFilterState) => void;
}

export function TemplateFilterPanel({
  isOpen,
  onClose,
  categories,
  filterState,
  onApplyFilters,
}: TemplateFilterPanelProps) {
  // Temporary draft filter state preserved until Apply Filters is clicked
  const [draftState, setDraftState] = useState<TemplateFilterState>(filterState);
  // Category list search query (only searches categories)
  const [categorySearchQuery, setCategorySearchQuery] = useState("");

  const panelRef = useRef<HTMLDivElement>(null);

  // Sync draft state with incoming active state whenever panel opens
  useEffect(() => {
    if (isOpen) {
      setDraftState(filterState);
      setCategorySearchQuery("");
    }
  }, [isOpen, filterState]);

  // Keyboard navigation & click outside listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleCategory = (slug: string) => {
    const slugLower = slug.toLowerCase();
    setDraftState((prev) => {
      const exists = prev.categories.includes(slugLower);
      const newCategories = exists
        ? prev.categories.filter((c) => c !== slugLower)
        : [...prev.categories, slugLower];
      return { ...prev, categories: newCategories };
    });
  };

  const handleClearAll = () => {
    setDraftState((prev) => ({ ...prev, categories: [] }));
  };

  const handleApply = () => {
    onApplyFilters(draftState);
    onClose();
  };

  return (
    <>
      {/* Subtle backdrop overlay for mobile/small screens */}
      <div className="fixed inset-0 z-40 bg-gray-900/30 backdrop-blur-xs md:hidden" aria-hidden="true" />

      {/* Filter Panel Popup/Drawer Container */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Template Filter Panel"
        className="fixed md:absolute right-4 md:right-0 top-16 md:top-14 z-50 w-[calc(100vw-2rem)] md:w-96 h-[520px] max-h-[85vh] bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Panel Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-gray-900">Filters</h2>
            {draftState.categories.length > 0 && (
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                {draftState.categories.length} selected
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close filter panel"
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Category Search Input Section */}
        <div className="p-3 border-b border-gray-100 bg-gray-50/50 shrink-0">
          <CategorySearch
            value={categorySearchQuery}
            onChange={setCategorySearchQuery}
            placeholder="Search categories..."
          />
        </div>

        {/* Internal Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
              Categories ({categories.length})
            </span>
            {draftState.categories.length > 0 && (
              <span className="text-[11px] text-gray-500 font-medium">
                Multi-select active
              </span>
            )}
          </div>

          {/* Category List */}
          <CategorySelector
            categories={categories}
            selectedCategories={draftState.categories}
            onToggleCategory={handleToggleCategory}
            searchQuery={categorySearchQuery}
          />
        </div>

        {/* Sticky Action Footer */}
        <FilterFooter
          onClearAll={handleClearAll}
          onApply={handleApply}
          onCancel={onClose}
          hasSelections={draftState.categories.length > 0}
          activeSelectionCount={draftState.categories.length}
        />
      </div>
    </>
  );
}
