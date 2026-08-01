"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  LayoutDashboard,
  Sparkles,
  Building2,
  Layers,
  BarChart3,
  Settings,
  Plus,
  LogOut,
  Menu,
  X,
} from "lucide-react";

export function UserDashboardHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    async function loadAvatar() {
      if (session?.user?.username) {
        try {
          const res = await fetch(`/api/v1/users/check-username?username=${encodeURIComponent(session.user.username)}`);
          if (res.ok) {
            const json = await res.json();
            if (json.data?.user?.image) {
              setDbAvatar(json.data.user.image);
            }
          }
        } catch (e) {}
      }
    }
    loadAvatar();
  }, [session?.user?.username]);

  const username = session?.user?.username || "";
  const profileHref = username ? `/profiles/${username}` : "/dashboard/overview";
  const userAvatar = dbAvatar || session?.user?.image || "";

  const navItems = [
    { name: "Overview", href: "/dashboard/overview", icon: LayoutDashboard },
    { name: "Meme Generator", href: "/dashboard/generator", icon: Sparkles },
    { name: "My Brands", href: "/dashboard/brands", icon: Building2 },
    { name: "Templates", href: "/dashboard/templates", icon: Layers },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 lg:px-8 mb-6">
      {/* Single Unified Floating Centered Pill Container */}
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-xs px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Horizontal Virlio Logo */}
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/dashboard/overview" className="flex items-center gap-2 shrink-0">
            <div className="relative h-10 w-28 sm:h-12 sm:w-36">
              <Image
                src="/images/logo-vertical.png"
                alt="Virlio"
                fill
                sizes="(max-width: 768px) 112px, 144px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Center: Navigation Options moved into upper header */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border border-blue-100 font-bold"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          {/* New Meme CTA */}
          <Link
            href="/dashboard/generator"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Meme</span>
          </Link>

          {/* User Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-600 transition-all cursor-pointer"
            >
              {userAvatar ? (
                <Image
                  src={userAvatar}
                  alt={session?.user?.name || "User Avatar"}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <User className="w-5 h-5 text-blue-600" />
              )}
            </button>

            {avatarMenuOpen && (
              <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl z-50 text-left space-y-1">
                <div className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 mb-1">
                  <p className="text-xs font-bold text-gray-900 truncate">
                    {session?.user?.name || "Virlio Creator"}
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium truncate">
                    {session?.user?.username ? `@${session.user.username}` : session?.user?.email}
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
                  <span>Overview</span>
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

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
            aria-label="Toggle Dashboard Menu"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileNavOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-4 shadow-xl space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard/overview" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors ${
                  isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
