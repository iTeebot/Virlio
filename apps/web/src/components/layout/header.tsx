"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, ArrowRight, User, LogOut, LayoutDashboard } from "lucide-react";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  const navLinks = [
    { name: "Explore", href: "/explore" },
    { name: "Templates", href: "/templates" },
    { name: "Categories", href: "/categories" },
    { name: "Leaderboard", href: "/leaderboards" },
    { name: "Services", href: "/pricing" },
    { name: "Community", href: "/community" },
  ];

  return (
    <header className="sticky top-3 sm:top-5 z-50 w-full px-4 sm:px-6 lg:px-8">
      {/* Floating Geometric Header Navbar Container */}
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between">
        {/* Brand Logo - Large Horizontal Logo with explicit readable app name */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <div className="relative h-12 w-40 sm:h-14 sm:w-48">
            <Image
              src="/images/logo-horizontal.png"
              alt="Virlio AI Meme Generator"
              fill
              sizes="(max-width: 768px) 160px, 200px"
              className="object-contain object-left"
              priority
            />
          </div>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight hidden sm:inline-block border-l border-gray-200 pl-3">
            Virlio
          </span>
        </Link>

        {/* Desktop Navigation Links - Single-line whitespace-nowrap */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors whitespace-nowrap"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {status === "authenticated" && session?.user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/overview"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-gray-900 px-3 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-blue-600" />
                <span>Dashboard</span>
              </Link>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors whitespace-nowrap"
            >
              Sign In
            </Link>
          )}

          <Link
            href="/dashboard/generator"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors shadow-xs whitespace-nowrap"
          >
            <span>Generate Free Meme</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden inline-flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Geometric Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden mt-2 mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white p-6 shadow-md space-y-4">
          <div className="flex flex-col space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium text-gray-700 hover:text-gray-900 py-1.5"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-200 flex flex-col gap-3">
            {status === "authenticated" ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  signOut({ callbackUrl: "/" });
                }}
                className="w-full text-center text-sm font-medium text-red-600 py-2.5 rounded-xl border border-red-200 hover:bg-red-50"
              >
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center text-sm font-medium text-gray-700 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/dashboard/generator"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full inline-flex items-center justify-center gap-2 text-sm font-semibold text-white py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              <span>Generate Free Meme</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
