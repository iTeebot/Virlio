"use client";

import React, { memo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/providers/user-store-provider";
import { HeaderUserDropdown } from "./header-user-dropdown";
import {
  ArrowRight,
  Menu,
  X,
  Plus,
  LayoutDashboard,
  Sparkles,
  Building2,
  Layers,
  BarChart3,
  Settings,
} from "lucide-react";

export interface AppHeaderProps {
  variant?: "public" | "dashboard" | "explore";
}

const DASHBOARD_NAV_ITEMS = [
  { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
  { name: "Meme Generator", href: "/dashboard/generator", icon: Sparkles },
  { name: "My Brands", href: "/dashboard/brands", icon: Building2 },
  { name: "Templates", href: "/dashboard/templates", icon: Layers },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

const PUBLIC_NAV_ITEMS = [
  { name: "Explore", href: "/explore" },
  { name: "Templates", href: "/templates" },
  { name: "Categories", href: "/categories" },
  { name: "Leaderboard", href: "/leaderboard" },
  { name: "Community", href: "/community" },
];

export const AppHeader = memo(function AppHeader({ variant }: AppHeaderProps) {
  const pathname = usePathname();
  const { user, status } = useUserStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAuthenticated = status === "authenticated" && Boolean(user);
  const isDashboardView = variant === "dashboard" || pathname.startsWith("/dashboard");

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/95 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-4 lg:gap-6">
          <Link href={isDashboardView ? "/dashboard/overview" : "/"} className="flex items-center gap-2 shrink-0">
            <div className="relative h-10 w-28 sm:h-12 sm:w-36">
              <Image
                src="/images/logo-horizontal.png"
                alt="Virlio Logo"
                fill
                sizes="(max-width: 768px) 112px, 144px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          {/* Navigation Bar */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-1.5 overflow-x-auto scrollbar-none">
            {isDashboardView
              ? DASHBOARD_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-500"}`} />
                      <span>{item.name}</span>
                    </Link>
                  );
                })
              : [
                  ...PUBLIC_NAV_ITEMS,
                  ...(isAuthenticated ? [{ name: "Dashboard", href: "/dashboard/overview" }] : []),
                ].map((link) => {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                        isActive
                          ? "bg-blue-50 text-blue-700 font-bold"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {link.name}
                    </Link>
                  );
                })}
          </nav>
        </div>

        {/* Right: Actions & Synced User Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              {isDashboardView ? (
                <Link
                  href="/dashboard/generator"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New Meme</span>
                </Link>
              ) : (
                <Link
                  href="/dashboard/generator"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shadow-xs whitespace-nowrap"
                >
                  <span>Generate Meme</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              {/* Single Centralized Synced User Dropdown */}
              <HeaderUserDropdown />
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>
              <Link
                href="/dashboard/generator"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shadow-xs whitespace-nowrap"
              >
                <span>Generate Free Meme</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white p-4 space-y-2 animate-in slide-in-from-top-2">
          {isDashboardView
            ? DASHBOARD_NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                  >
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{item.name}</span>
                  </Link>
                );
              })
            : [
                ...PUBLIC_NAV_ITEMS,
                ...(isAuthenticated ? [{ name: "Dashboard", href: "/dashboard/overview" }] : []),
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl"
                >
                  {link.name}
                </Link>
              ))}
        </div>
      )}
    </header>
  );
});
