"use client";

import React, { useState } from "react";
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
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          {/* 1. Left: Brand Logo & Explore Tag */}
          <div className="flex items-center gap-2.5 shrink-0">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-9 w-32 sm:w-40">
                <Image
                  src="/images/logo-horizontal.png"
                  alt="Virlio Logo"
                  fill
                  sizes="160px"
                  className="object-contain object-left"
                  priority
                />
              </div>
            </Link>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100 uppercase tracking-wider">
              <Compass className="w-3 h-3 text-blue-600" />
              <span>Explore</span>
            </span>
          </div>

          {/* 2. Middle: Real-time Search Input */}
          <div className="flex-1 max-w-lg relative hidden sm:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memes, brands, topics..."
              value={internalQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 focus:bg-white transition-all"
            />
          </div>

          {/* 3. Right: Auth Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {status === "authenticated" && session?.user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard/overview"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shadow-2xs"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                  <span className="hidden md:inline">Dashboard</span>
                </Link>

                <Link
                  href="/dashboard/generator"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Create Meme</span>
                </Link>

                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: "/explore" })}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login?callbackUrl=/explore"
                  className="text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors"
                >
                  Log in
                </Link>

                <Link
                  href="/register?callbackUrl=/explore"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 4. Sub-Navigation Filter Chips */}
        {onFilterChange && (
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2.5 border-t border-gray-100 text-xs font-medium">
            {filterTabs.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => onFilterChange(filter)}
                className={`px-3 py-1 rounded-lg transition-all shrink-0 font-semibold ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900 border border-gray-200/60"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
