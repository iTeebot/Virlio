"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Sparkles,
  Layers,
  Building2,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  User,
  Globe,
  Award,
} from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const username = session?.user?.username || "";
  const profileHref = username ? `/profiles/${username}` : "/dashboard/overview";

  // Close dropdown menu on click outside or escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAvatarMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navItems = [
    { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { name: "Templates", href: "/dashboard/templates", icon: Layers },
    { name: "My Brands", href: "/dashboard/brands", icon: Building2 },
    { name: "Create Meme", href: "/dashboard/memes/create", icon: Sparkles },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 lg:px-8 mb-4">
      {/* Floating Header Navbar Container */}
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Left: Vertical Logo & Explore Link */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="relative h-12 w-28 sm:h-14 sm:w-36">
              <Image
                src="/images/logo-vertical.png"
                alt="Virlio Logo"
                fill
                sizes="(max-width: 768px) 120px, 160px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <Link
            href="/explore"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Explore Public Feed"
          >
            <Globe className="w-3.5 h-3.5 text-blue-600" />
            <span>Explore</span>
          </Link>
        </div>

        {/* Middle: Dashboard Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 overflow-x-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions & User Avatar Dropdown */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/templates/upload"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Template</span>
          </Link>

          {session?.user && (
            <div className="relative pl-2 border-l border-gray-200" ref={dropdownRef}>
              {/* Profile Avatar Button */}
              <button
                type="button"
                onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
                aria-expanded={avatarMenuOpen}
                aria-haspopup="true"
                aria-label="User Account Menu"
                className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-600 hover:border-transparent transition-all cursor-pointer"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name || "User Avatar"}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {/* Avatar Menu Dropdown Card */}
              {avatarMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl z-50 text-left space-y-1 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 mb-1">
                    <p className="text-xs font-bold text-gray-900 truncate">
                      {session.user.name || "Virlio Creator"}
                    </p>
                    <p className="text-[11px] text-gray-500 font-medium truncate">
                      {session.user.username ? `@${session.user.username}` : session.user.email}
                    </p>
                  </div>

                  <Link
                    href={profileHref}
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    <User className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>View Profile</span>
                  </Link>

                  <Link
                    href="/dashboard/overview"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Dashboard Overview</span>
                  </Link>

                  <Link
                    href="/dashboard/brands"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>My Brands</span>
                  </Link>

                  <Link
                    href="/dashboard/memes"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>My Memes</span>
                  </Link>

                  <Link
                    href="/dashboard/templates"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    <Layers className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>My Templates</span>
                  </Link>

                  <Link
                    href="/achievements"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    <Award className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Achievements</span>
                  </Link>

                  <Link
                    href="/dashboard/settings"
                    onClick={() => setAvatarMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors"
                  >
                    <Settings className="w-4 h-4 text-gray-500 shrink-0" />
                    <span>Settings</span>
                  </Link>

                  <div className="pt-1 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
