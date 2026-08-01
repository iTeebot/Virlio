"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";
import {
  Search,
  Code,
  Megaphone,
  Utensils,
  DollarSign,
  Gamepad2,
  Rocket,
  Home,
  GraduationCap,
  Stethoscope,
  Scale,
  Compass,
  Cpu,
  ArrowRight,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Megaphone,
  Utensils,
  DollarSign,
  Gamepad2,
  Rocket,
  Home,
  GraduationCap,
  Stethoscope,
  Scale,
  Compass,
  Cpu,
};

export default function CategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/v1/categories");
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          const apiCategories = Array.isArray(data?.categories) ? data.categories : [];
          const counts = data?.counts || {};

          // Build merged list starting with predefined categories
          const merged = PREDEFINED_CATEGORIES.map((p) => ({
            ...p,
            count: counts[p.slug] ?? 0,
          }));

          // Add any custom categories present in DB that aren't in predefined list
          apiCategories.forEach((cat: any) => {
            if (!merged.some((m) => m.slug.toLowerCase() === cat.slug.toLowerCase())) {
              merged.push({
                id: cat.id || `custom-${cat.slug}`,
                slug: cat.slug,
                name: cat.name,
                description: cat.description || `Community meme templates created under ${cat.name}.`,
                iconName: "Code",
                count: cat.count || counts[cat.slug] || 0,
              });
            }
          });

          setCategoriesList(merged);
        }
      } catch (err) {
        setCategoriesList(PREDEFINED_CATEGORIES.map((p) => ({ ...p, count: 0 })));
      }
    }
    fetchCategories();
  }, []);

  const displayList = categoriesList.length > 0 ? categoriesList : PREDEFINED_CATEGORIES.map((p) => ({ ...p, count: 0 }));

  const filteredCategories = displayList.filter((cat) =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Page Title Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
              Meme Template Categories
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Predefined industry categories for structured meme creation and marketing across business sectors.
            </p>
          </div>

          {/* Search Bar */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search categories or business sectors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-colors shadow-xs"
              />
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCategories.map((cat) => {
              const Icon = ICON_MAP[cat.iconName] || Code;
              const count = cat.count ?? 0;

              return (
                <div key={cat.slug} className="virlio-card p-6 flex flex-col justify-between bg-white border border-gray-200">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded border border-gray-200">
                        {count} {count === 1 ? "Template" : "Templates"}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 mb-2">{cat.name}</h2>
                    <p className="text-xs text-gray-600 leading-relaxed mb-6">{cat.description}</p>
                  </div>

                  <Link
                    href={`/templates?category=${cat.slug}`}
                    className="inline-flex items-center justify-between text-xs font-semibold text-blue-600 hover:text-blue-700 pt-4 border-t border-gray-100"
                  >
                    <span>Browse {cat.name} Templates</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
