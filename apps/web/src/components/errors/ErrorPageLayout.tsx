"use client";

import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, RefreshCw, Home, Search, MessageSquare, Compass, ShieldAlert, Wifi, Sparkles, Layers } from "lucide-react";

export interface ErrorPageLayoutProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  description: string;
  httpStatus?: number | string;
  statusBadgeText?: string;
  primaryButtonText: string;
  primaryButtonHref?: string;
  onPrimaryClick?: () => void;
  secondaryButtonText?: string;
  secondaryButtonHref?: string;
  onSecondaryClick?: () => void;
  primaryButtonIconName?: "home" | "refresh" | "explore" | "search" | "retry" | "back";
  secondaryButtonIconName?: "back" | "support" | "home" | "leaderboard" | "guidelines" | "dashboard" | "explore";
}

export function ErrorPageLayout({
  imageSrc,
  imageAlt,
  title,
  description,
  httpStatus,
  statusBadgeText,
  primaryButtonText,
  primaryButtonHref,
  onPrimaryClick,
  secondaryButtonText,
  secondaryButtonHref,
  onSecondaryClick,
  primaryButtonIconName = "home",
  secondaryButtonIconName = "back",
}: ErrorPageLayoutProps) {
  const router = useRouter();

  // Keyboard accessibility: ESC key to go back or home
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        router.back();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  const handleDefaultSecondaryClick = () => {
    if (onSecondaryClick) {
      onSecondaryClick();
    } else if (!secondaryButtonHref) {
      router.back();
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white text-gray-900 px-4 sm:px-6 lg:px-8 py-12 virlio-landing-bg selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-lg mx-auto text-center space-y-8">
        {/* Status Badge / Code */}
        {(httpStatus || statusBadgeText) && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold tracking-wide uppercase shadow-2xs">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
            <span>{httpStatus ? `HTTP Status ${httpStatus}` : statusBadgeText}</span>
          </div>
        )}

        {/* Large Illustration Asset */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto transition-transform hover:scale-102 duration-300">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 640px) 256px, 320px"
            className="object-contain drop-shadow-sm"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
            {title}
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {/* Primary CTA */}
          {primaryButtonHref ? (
            <Link
              href={primaryButtonHref}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-xs"
            >
              {primaryButtonIconName === "refresh" && <RefreshCw className="w-4 h-4" />}
              {primaryButtonIconName === "retry" && <Wifi className="w-4 h-4" />}
              {primaryButtonIconName === "explore" && <Compass className="w-4 h-4" />}
              {primaryButtonIconName === "search" && <Search className="w-4 h-4" />}
              {primaryButtonIconName === "home" && <Home className="w-4 h-4" />}
              <span>{primaryButtonText}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={onPrimaryClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-xs"
            >
              {primaryButtonIconName === "refresh" && <RefreshCw className="w-4 h-4" />}
              {primaryButtonIconName === "retry" && <Wifi className="w-4 h-4" />}
              {primaryButtonIconName === "explore" && <Compass className="w-4 h-4" />}
              {primaryButtonIconName === "search" && <Search className="w-4 h-4" />}
              {primaryButtonIconName === "home" && <Home className="w-4 h-4" />}
              <span>{primaryButtonText}</span>
            </button>
          )}

          {/* Secondary CTA */}
          {secondaryButtonText && (
            secondaryButtonHref ? (
              <Link
                href={secondaryButtonHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-2xs"
              >
                {secondaryButtonIconName === "back" && <ArrowLeft className="w-4 h-4 text-gray-500" />}
                {secondaryButtonIconName === "support" && <MessageSquare className="w-4 h-4 text-blue-600" />}
                {secondaryButtonIconName === "leaderboard" && <Sparkles className="w-4 h-4 text-blue-600" />}
                {secondaryButtonIconName === "dashboard" && <Layers className="w-4 h-4 text-gray-500" />}
                {secondaryButtonIconName === "explore" && <Compass className="w-4 h-4 text-blue-600" />}
                {secondaryButtonIconName === "home" && <Home className="w-4 h-4 text-gray-500" />}
                <span>{secondaryButtonText}</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleDefaultSecondaryClick}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-800 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 shadow-2xs"
              >
                {secondaryButtonIconName === "back" && <ArrowLeft className="w-4 h-4 text-gray-500" />}
                {secondaryButtonIconName === "support" && <MessageSquare className="w-4 h-4 text-blue-600" />}
                {secondaryButtonIconName === "leaderboard" && <Sparkles className="w-4 h-4 text-blue-600" />}
                {secondaryButtonIconName === "dashboard" && <Layers className="w-4 h-4 text-gray-500" />}
                {secondaryButtonIconName === "explore" && <Compass className="w-4 h-4 text-blue-600" />}
                {secondaryButtonIconName === "home" && <Home className="w-4 h-4 text-gray-500" />}
                <span>{secondaryButtonText}</span>
              </button>
            )
          )}
        </div>
      </div>
    </main>
  );
}
