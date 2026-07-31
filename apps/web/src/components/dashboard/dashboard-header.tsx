"use client";

import React from "react";
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
} from "lucide-react";

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

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
      <div className="mx-auto max-w-7xl rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-md shadow-sm px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Public Site Shortcut */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative h-12 w-44 sm:w-52">
              <Image
                src="/images/logo-horizontal.png"
                alt="Virlio Logo"
                fill
                sizes="(max-width: 768px) 180px, 220px"
                className="object-contain object-left"
                priority
              />
            </div>
          </Link>

          <Link
            href="/explore"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Explore Public Feed"
          >
            <Globe className="w-3.5 h-3.5" />
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

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/dashboard/templates/upload"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white transition-colors shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Upload Template</span>
          </Link>

          {session?.user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
              <Link
                href={session.user.username ? `/profiles/${session.user.username}` : "/dashboard/overview"}
                title="View Your Public Profile"
                className="relative w-8 h-8 rounded-full overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-500 transition-all"
              >
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
              </Link>

              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
