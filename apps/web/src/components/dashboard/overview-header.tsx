"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Building2, Upload, ArrowRight } from "lucide-react";

interface OverviewHeaderProps {
  user: {
    name?: string | null;
    username?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function OverviewHeader({ user }: OverviewHeaderProps) {
  const displayName = user.name || (user.username ? `@${user.username}` : user.email?.split("@")[0]) || "Creator";

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-gray-200">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
            Operational Dashboard
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
          Welcome back, {displayName} 👋
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mt-1">
          Here is an overview of your viral brand memes, active workspaces, and community engagement.
        </p>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <Link
          href="/dashboard/memes/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
        >
          <Sparkles className="w-4 h-4" />
          <span>Create Meme</span>
        </Link>

        <Link
          href="/dashboard/brands/new"
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-colors"
        >
          <Building2 className="w-4 h-4 text-gray-500" />
          <span className="hidden sm:inline">New Brand</span>
        </Link>

        <Link
          href="/dashboard/templates/upload"
          className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-xs transition-colors"
        >
          <Upload className="w-4 h-4 text-gray-500" />
          <span className="hidden sm:inline">Upload Template</span>
        </Link>
      </div>
    </div>
  );
}
