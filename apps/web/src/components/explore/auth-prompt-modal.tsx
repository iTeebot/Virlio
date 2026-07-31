"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, X, LogIn, UserPlus } from "lucide-react";

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthPromptModal({
  isOpen,
  onClose,
  title = "Sign in to interact",
  description = "Join Virlio to upvote memes, save community templates, and build your brand identity.",
}: AuthPromptModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Close auth modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Icon & Header */}
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-4 text-blue-600">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTAs */}
        <div className="space-y-3 pt-2">
          <Link
            href="/login?callbackUrl=/explore"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-sm font-semibold text-white transition-colors shadow-xs"
          >
            <LogIn className="w-4 h-4" />
            <span>Log In to Your Account</span>
          </Link>

          <Link
            href="/register?callbackUrl=/explore"
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-semibold text-gray-800 transition-colors shadow-2xs"
          >
            <UserPlus className="w-4 h-4 text-gray-500" />
            <span>Create Free Account</span>
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-center text-gray-400">
          Unauthenticated users can browse and read all public content freely.
        </p>
      </div>
    </div>
  );
}
