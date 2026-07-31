"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Search,
  Compass,
  LayoutDashboard,
  LogOut,
  User,
  Plus,
  ArrowRight,
  Menu,
  X,
  Building2,
  Sparkles,
  Layers,
  Award,
  Settings,
} from "lucide-react";

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
  const { data: session, status } = useSession();
  const [internalQuery, setInternalQuery] = useState(searchQuery);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filterTabs = [
    "Trending",
    "Latest",
    "Popular",
    "Verified Brands",
    "Top Templates",
  ];

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
        setMobileMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchInput = (val: string) => {
    setInternalQuery(val);
    if (onSearchChange) onSearchChange(val);
  };

  const username = session?.user?.username || "";
  const profileHref = username ? `/profiles/${username}` : "/dashboard/overview";

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 lg:px-8 mb-4">
      {/* Floating Header Navbar Container */}
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* 1. Left: Vertical Logo & Explore Tag */}
        <div className="flex items-center gap-3 shrink-0">
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

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5 text-blue-600" />
            <span>Explore</span>
          </span>
        </div>

        {/* 2. Middle: Real-time Search Bar (Explore Header Search) */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search memes, brands, topics..."
            value={internalQuery}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
          />
        </div>

        {/* 3. Right: Actions & User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/overview"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                title="Go to Dashboard"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span>Dashboard</span>
              </Link>

              <Link
                href="/dashboard/generator"
                className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Meme</span>
              </Link>

              {/* User Profile Avatar Dropdown */}
              <div className="relative" ref={dropdownRef}>
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
                          signOut({ callbackUrl: "/explore" });
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
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login?callbackUrl=/explore"
                className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors whitespace-nowrap"
              >
                Sign In
              </Link>

              <Link
                href="/register?callbackUrl=/explore"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors whitespace-nowrap"
              >
                <span>Sign Up</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sub-Navigation Filter Chips */}
      {onFilterChange && (
        <div className="mx-auto max-w-7xl mt-2 px-2 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs font-medium">
          {filterTabs.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => onFilterChange(filter)}
              className={`px-3 py-1.5 rounded-xl transition-all shrink-0 font-semibold ${
                activeFilter === filter
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      )}

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 shadow-md space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search memes, brands..."
              value={internalQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-900"
            />
          </div>

          {status === "authenticated" && session?.user ? (
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <Link
                href={profileHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 text-xs font-semibold text-gray-800"
              >
                <div className="relative w-7 h-7 rounded-full overflow-hidden bg-blue-50 border border-blue-200">
                  {session.user.image ? (
                    <Image src={session.user.image} alt="User" fill unoptimized className="object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <span>{session.user.name || "View Profile"}</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/explore" });
                }}
                className="text-xs font-semibold text-red-600 hover:underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              <Link
                href="/login?callbackUrl=/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-semibold text-gray-700 py-2 rounded-xl border border-gray-200"
              >
                Sign In
              </Link>
              <Link
                href="/register?callbackUrl=/explore"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-xs font-semibold text-white py-2 rounded-xl bg-blue-600"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
