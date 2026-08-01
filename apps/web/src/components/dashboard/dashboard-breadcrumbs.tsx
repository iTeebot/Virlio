"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBrand } from "./brand-context";
import { ChevronRight } from "lucide-react";

export function DashboardBreadcrumbs() {
  const pathname = usePathname();
  const { currentBrand } = useBrand();

  if (!currentBrand) return null;

  const parts = pathname.split("/").filter(Boolean);
  // Expected parts: ["dashboard", "brands", ":brandId", "section"]
  const brandIndex = parts.indexOf("brands");
  let section = parts[brandIndex + 2] || "overview";

  const sectionName = section === "generate" ? "Meme Studio" : section
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <nav className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
      <Link href="/dashboard" className="hover:text-gray-900 transition-colors">
        Dashboard
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <Link href={`/dashboard/brands/${currentBrand.id}/overview`} className="hover:text-gray-900 transition-colors truncate max-w-[120px] sm:max-w-[200px]">
        {currentBrand.name}
      </Link>
      <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
      <span className="text-gray-900 font-bold capitalize">{sectionName}</span>
    </nav>
  );
}
