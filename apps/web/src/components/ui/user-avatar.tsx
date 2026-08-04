"use client";

import React, { useState, useEffect, memo } from "react";
import Image from "next/image";
import { parseAvatarPosition } from "@/lib/utils/avatar-position";
import { useUserStore } from "@/providers/user-store-provider";

export interface UserAvatarProps {
  src?: string | null;
  name?: string | null;
  username?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | number;
  className?: string;
  isCurrentUser?: boolean;
  priority?: boolean;
}

const SIZE_MAP = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-base",
  xl: "w-20 h-20 sm:w-24 sm:h-24 text-xl",
  "2xl": "w-28 h-28 sm:w-32 sm:h-32 text-2xl",
};

export const UserAvatar = memo(function UserAvatar({
  src,
  name,
  username,
  size = "md",
  className = "",
  isCurrentUser = false,
  priority = false,
}: UserAvatarProps) {
  let storeAvatarUrl = "";
  try {
    const store = useUserStore();
    if (isCurrentUser && store?.avatarUrl) {
      storeAvatarUrl = store.avatarUrl;
    }
  } catch (e) {
    // Graceful fallback if rendered outside UserStoreProvider
  }

  const activeSrc = isCurrentUser ? storeAvatarUrl || src || null : src || null;
  const [currentSrc, setCurrentSrc] = useState<string | null>(activeSrc);

  useEffect(() => {
    setCurrentSrc(activeSrc);
  }, [activeSrc]);

  // Global event listener for optimistic avatar updates across non-store environments
  useEffect(() => {
    if (!isCurrentUser && typeof window !== "undefined") {
      const handleGlobalAvatarUpdate = (e: any) => {
        if (e.detail?.avatarUrl) {
          setCurrentSrc(e.detail.avatarUrl);
        }
      };
      window.addEventListener("virlio:avatar-updated", handleGlobalAvatarUpdate);
      return () => window.removeEventListener("virlio:avatar-updated", handleGlobalAvatarUpdate);
    }
  }, [isCurrentUser]);

  const displayName = name || username || "User";
  const initials = displayName
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase() || "U";

  const sizeClasses = typeof size === "number" ? "" : SIZE_MAP[size] || SIZE_MAP.md;
  const customDimensions = typeof size === "number" ? { width: size, height: size } : undefined;

  const { objectPosition, objectFit, cleanUrl } = parseAvatarPosition(currentSrc);

  return (
    <div
      style={customDimensions}
      className={`relative rounded-full overflow-hidden bg-blue-50 border-2 border-white shadow-xs flex items-center justify-center shrink-0 ring-1 ring-gray-200/80 ${sizeClasses} ${className}`}
    >
      {cleanUrl ? (
        <Image
          src={cleanUrl}
          alt={`${displayName}'s Avatar`}
          fill
          priority={priority}
          sizes="(max-width: 768px) 96px, 128px"
          style={{ objectFit, objectPosition }}
          className="transition-transform duration-200"
          unoptimized={cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")}
        />
      ) : (
        <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-extrabold tracking-wider uppercase select-none">
          {initials}
        </div>
      )}
    </div>
  );
});
