"use client";

import React, { useState } from "react";
import { Share2, X, Copy, Check, ExternalLink } from "lucide-react";
import { toast } from "@/components/ui/toast";

interface ShareProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  displayName: string;
}

export function ShareProfileModal({
  isOpen,
  onClose,
  username,
  displayName,
}: ShareProfileModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const profileUrl = typeof window !== "undefined"
    ? `${window.location.origin}/profiles/${username}`
    : `https://virlio.iteebot.com/profiles/${username}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast.success("Profile URL copied to clipboard!", "Copied");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error("Failed to copy URL", "Copy Error");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} on Virlio`,
          text: `Check out @${username}'s creator profile, memes, templates, and badges on Virlio!`,
          url: profileUrl,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl border border-gray-200 shadow-2xl max-w-md w-full p-6 sm:p-8 space-y-6 text-left relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Share Profile</h3>
            <p className="text-xs text-gray-500">
              Share @{username}&apos;s profile on social channels
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
            Canonical Profile Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={profileUrl}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 font-mono focus:outline-none"
            />
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          {typeof navigator !== "undefined" && "share" in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Share via Device Menu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
