"use client";

import React from "react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden text-gray-900">
      {/* Foreground Content: Centered Auth Card & Footer */}
      <div className="relative z-10 min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Top spacing / navigation bar spacer */}
        <div className="shrink-0 h-4" />

        {/* Centered Authentication Card Container */}
        <div className="mx-auto w-full max-w-md my-auto">
          {children}
        </div>

        {/* Muted Auth Footer */}
        <div className="mt-6 text-center text-xs text-gray-500 space-y-1 shrink-0">
          <div className="flex items-center justify-center gap-4 text-gray-600 font-medium">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <span className="text-gray-300">•</span>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <span className="text-gray-300">•</span>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Contact</Link>
          </div>
          <p>&copy; {new Date().getFullYear()} Teebot Inc. Built by Teebot.</p>
        </div>
      </div>
    </div>
  );
}
