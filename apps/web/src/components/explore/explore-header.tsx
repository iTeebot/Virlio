"use client";

import React, { useState } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { Search } from "lucide-react";

interface ExploreHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function ExploreHeader({
  searchQuery = "",
  onSearchChange,
  activeFilter = "Trending",
  onFilterChange,
}: ExploreHeaderProps) {
  const [internalQuery, setInternalQuery] = useState(searchQuery);

  const filterTabs = [
    "Trending",
    "Latest",
    "Popular",
    "Verified Brands",
    "Top Templates",
  ];

  const handleSearchInput = (val: string) => {
    setInternalQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  return (
    <div className="space-y-4 mb-6">
      <AppHeader variant="explore" />

      {/* Explore Sub-Header: Search & Filter Toolbar */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="virlio-card p-4 sm:p-5 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            {/* Search Input Bar */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={internalQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                placeholder="Search viral memes, templates, brands, and creators..."
                className="w-full pl-11 pr-4 py-2.5 rounded-2xl border border-gray-200 bg-gray-50/50 text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {filterTabs.map((tab) => {
                const isActive = activeFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onFilterChange && onFilterChange(tab)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
