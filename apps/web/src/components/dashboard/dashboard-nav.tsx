"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Building2,
  BarChart3,
  Settings,
  Plus,
} from "lucide-react";

export function DashboardNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { name: "Meme Generator", href: "/dashboard/generator", icon: Sparkles },
    { name: "My Brands", href: "/dashboard/brands", icon: Building2 },
    { name: "Templates", href: "/dashboard/templates", icon: Layers },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="w-full border-b border-gray-200 bg-white/90 backdrop-blur-sm sticky top-[84px] z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 overflow-x-auto no-scrollbar">
          <nav className="flex items-center gap-1 sm:gap-2 shrink-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600 border border-blue-100"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="hidden sm:flex items-center gap-2.5 shrink-0 pl-4 border-l border-gray-200">
            <Link
              href="/dashboard/generator"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Meme</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
