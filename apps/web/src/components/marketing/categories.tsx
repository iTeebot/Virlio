"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";
import {
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

export function CategoriesSection() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/v1/categories");
        if (res.ok) {
          const json = await res.json();
          const counts = json.data || json;
          if (typeof counts === "object" && counts !== null) {
            setCategoryCounts(counts);
          }
        }
      } catch (err) {
        // Fallback: 0 templates
      }
    }

    fetchCounts();
  }, []);

  return (
    <section className="py-20 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Diverse Industries
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Explore Meme Categories Mapped to Every Sector
          </p>
          <p className="mt-3 text-base text-gray-600">
            Predefined industry categories for structured template creation and brand marketing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {PREDEFINED_CATEGORIES.map((cat) => {
            const Icon = ICON_MAP[cat.iconName] || Code;
            const count = categoryCounts[cat.slug] ?? 0;

            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="virlio-card p-6 flex flex-col justify-between group hover:border-blue-600 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                      {count} {count === 1 ? "Template" : "Templates"}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {cat.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
