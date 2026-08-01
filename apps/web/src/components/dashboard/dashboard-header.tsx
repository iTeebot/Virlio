"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { BrandSwitcher } from "./brand-switcher";
import { DashboardBreadcrumbs } from "./dashboard-breadcrumbs";
import { Menu } from "lucide-react";

interface DashboardHeaderProps {
  onMobileMenuToggle?: () => void;
  user?: any;
}

export function DashboardHeader({ onMobileMenuToggle, user }: DashboardHeaderProps) {
  return (
    <header className="h-16 bg-white border-b border-gray-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-gray-100 transition-colors"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Official Virlio Logo Graphic */}
        <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-2">
          <div className="relative h-9 w-28 sm:h-10 sm:w-32">
            <Image
              src="/images/logo-vertical.png"
              alt="Virlio"
              fill
              sizes="(max-width: 768px) 112px, 128px"
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <div className="hidden md:block border-l border-gray-200 pl-4">
          <DashboardBreadcrumbs />
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Brand Switcher in top right */}
        <BrandSwitcher />

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-xs text-gray-700 overflow-hidden shrink-0">
          {user?.image ? (
            <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
          ) : (
            user?.name?.slice(0, 2).toUpperCase() || "U"
          )}
        </div>
      </div>
    </header>
  );
}
