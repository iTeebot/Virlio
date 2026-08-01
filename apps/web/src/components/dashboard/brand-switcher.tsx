"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "./brand-context";
import { ChevronDown, Plus, Check, Building2, ShieldCheck, Search } from "lucide-react";

export function BrandSwitcher() {
  const { currentBrand, userBrands, switchBrand } = useBrand();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!currentBrand) return null;

  const filteredBrands = userBrands.filter((b) =>
    b.name.toLowerCase().includes(query.toLowerCase()) || b.slug.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 px-3 py-1.5 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl transition-colors shadow-2xs text-left"
      >
        <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
          {currentBrand.logo_url ? (
            <img src={currentBrand.logo_url} alt={currentBrand.name} className="w-full h-full object-cover" />
          ) : (
            currentBrand.name.slice(0, 2).toUpperCase()
          )}
        </div>

        <div className="hidden sm:block text-xs font-bold text-gray-900 truncate max-w-[130px]">
          {currentBrand.name}
        </div>

        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-2 space-y-2">
          <div className="px-2 pt-1 pb-2 border-b border-gray-100 space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Switch Brand</span>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brands..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 scrollbar-none">
            {filteredBrands.map((b) => {
              const isSelected = b.id === currentBrand.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => {
                    switchBrand(b.id);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-colors ${
                    isSelected ? "bg-blue-50 text-blue-900 font-bold" : "hover:bg-gray-50 text-gray-700 font-semibold"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-6 h-6 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0 text-xs font-bold text-gray-700">
                      {b.logo_url ? <img src={b.logo_url} alt={b.name} className="w-full h-full object-cover" /> : b.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <span className="block truncate">{b.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">@{b.slug}</span>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-gray-100">
            <Link
              href="/dashboard/brands/new"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 w-full p-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              <Plus className="w-4 h-4" /> Create New Brand
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
