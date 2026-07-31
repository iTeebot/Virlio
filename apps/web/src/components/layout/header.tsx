"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu,
  X,
  ArrowRight,
  User,
  LogOut,
  LayoutDashboard,
  Building2,
  Layers,
  Award,
  Settings,
  Sparkles,
} from "lucide-react";

export function Header() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = status === "authenticated" && !!session?.user;
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

  // Public Navigation Links (Logged-out)
  const publicNavLinks = [
    { name: "Explore", href: "/explore" },
    { name: "Templates", href: "/templates" },
    { name: "Categories", href: "/categories" },
    { name: "Leaderboard", href: "/leaderboards" },
    { name: "Pricing", href: "/pricing" },
    { name: "Community", href: "/community" },
  ];

  // Authenticated Navigation Links (Logged-in)
  const loggedInNavLinks = [
    { name: "Explore", href: "/explore" },
    { name: "Templates", href: "/templates" },
    { name: "Categories", href: "/categories" },
    { name: "Leaderboard", href: "/leaderboards" },
    { name: "Community", href: "/community" },
    { name: "Dashboard", href: "/dashboard/overview" },
  ];

  const currentNavLinks = isAuthenticated ? loggedInNavLinks : publicNavLinks;

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 lg:px-8">
      {/* Floating Centered Container */}
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-xs px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Horizontal Virlio Logo */}
        <div className="flex items-center gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
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

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
            {currentNavLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap ${
                    isActive
                      ? "text-blue-600 font-bold"
                      : "text-gray-700 hover:text-blue-600"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-3 shrink-0">
          {isAuthenticated ? (
            /* Authenticated Header Right Side */
            <div className="flex items-center gap-3">
              {/* Primary Action CTA */}
              <Link
                href="/dashboard/generator"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white transition-colors shadow-xs whitespace-nowrap"
              >
                <span>Generate Meme</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* User Avatar Dropdown Entrypoint */}
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
                      <span>Dashboard</span>
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
            </div>
          ) : (
            /* Unauthenticated Header Right Side */
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
            className="lg:hidden inline-flex items-center justify-center p-2 rounded-xl text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Container */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-5 shadow-xl space-y-4 animate-in slide-in-from-top-2 duration-150">
          <div className="flex flex-col space-y-1">
            {currentNavLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-gray-200 flex flex-col gap-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  href={profileHref}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-800 bg-gray-50 rounded-xl"
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

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-center text-xs font-semibold text-gray-700 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
                  >
                    Settings
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="text-center text-xs font-semibold text-red-600 py-2.5 rounded-xl border border-red-100 bg-red-50 hover:bg-red-100"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-xs font-semibold text-gray-700 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  href="/dashboard/generator"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold text-white py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700"
                >
                  <span>Generate Free Meme</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
