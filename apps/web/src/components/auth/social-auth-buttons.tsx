"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { GoogleIcon, GithubIcon, FacebookIcon, LinkedinIcon } from "@/components/auth/social-icons";
import { toast } from "@/components/ui/toast";
import { Loader2 } from "lucide-react";

export interface SocialAuthButtonsProps {
  disabled?: boolean;
  onProviderSelect?: (provider: "google" | "github" | "facebook" | "linkedin") => void;
  className?: string;
}

export function SocialAuthButtons({
  disabled = false,
  onProviderSelect,
  className = "",
}: SocialAuthButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const providers = [
    { id: "google" as const, name: "Google", icon: <GoogleIcon className="w-4 h-4" /> },
    { id: "github" as const, name: "GitHub", icon: <GithubIcon className="w-4 h-4 text-gray-900" /> },
    { id: "facebook" as const, name: "Facebook", icon: <FacebookIcon className="w-4 h-4" /> },
    { id: "linkedin" as const, name: "LinkedIn", icon: <LinkedinIcon className="w-4 h-4" /> },
  ];

  const handleSignIn = async (provider: typeof providers[number]) => {
    if (disabled || loadingProvider) return;

    if (onProviderSelect) {
      onProviderSelect(provider.id);
      return;
    }

    setLoadingProvider(provider.id);

    try {
      // Standard NextAuth OAuth redirect flow
      await signIn(provider.id, {
        callbackUrl: "/dashboard/overview",
      });
    } catch (err: any) {
      toast.error(
        `${provider.name} login failed. ${err?.message || "Feature not configured or API key missing."}`,
        "Social Login Error",
        6000
      );
      setLoadingProvider(null);
    }
  };

  return (
    <div className={`grid grid-cols-2 gap-2.5 ${className}`}>
      {providers.map((p) => {
        const isLoading = loadingProvider === p.id;
        return (
          <button
            key={p.id}
            type="button"
            disabled={disabled || !!loadingProvider}
            onClick={() => handleSignIn(p)}
            className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1 transition-all disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : p.icon}
            <span>{p.name}</span>
          </button>
        );
      })}
    </div>
  );
}
