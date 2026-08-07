"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  User,
  LayoutDashboard,
  Building2,
  Settings,
  LogOut,
} from "lucide-react";

export function HeaderUserDropdown() {
  const { data: session } = useSession();
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [dbAvatar, setDbAvatar] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAvatarMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setAvatarMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Listen to real-time virlio:avatar-updated events without issuing unneeded network fetches on mount
  useEffect(() => {
    const handleAvatarUpdate = (e: any) => {
      if (e.detail?.avatarUrl) {
        setDbAvatar(e.detail.avatarUrl);
      }
    };

    if (typeof window !== "undefined") {
      window.addEventListener("virlio:avatar-updated", handleAvatarUpdate);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("virlio:avatar-updated", handleAvatarUpdate);
      }
    };
  }, []);

  if (!session?.user) return null;

  const username = session.user.username || "";
  const profileHref = username ? `/profiles/${username}` : "/dashboard/overview";
  const userAvatar = dbAvatar || session.user.image || "";

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
        aria-expanded={avatarMenuOpen}
        aria-haspopup="true"
        aria-label="User Account Menu"
        className="hover:ring-2 hover:ring-blue-600 rounded-full transition-all cursor-pointer block"
      >
        <UserAvatar
          src={userAvatar}
          name={session.user.name}
          username={session.user.username}
          size="sm"
          isCurrentUser
        />
      </button>

      {avatarMenuOpen && (
        <div className="absolute right-0 mt-2 w-60 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl z-[999] text-left space-y-1 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-100 mb-1">
            <p className="text-xs font-bold text-gray-900 truncate">
              {session.user.name || "Virlio Creator"}
            </p>
            <p className="text-[11px] text-gray-500 font-medium truncate">
              {username ? `@${username}` : session.user.email}
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
            <span>Overview</span>
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
  );
}
