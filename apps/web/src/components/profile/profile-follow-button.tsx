"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserCheck, UserPlus, Loader2 } from "lucide-react";
import { toast } from "@/components/ui/toast";

export interface ProfileFollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  initialIsFollowing: boolean;
  initialFollowerCount: number;
  onFollowerCountChange?: (count: number) => void;
}

export function ProfileFollowButton({
  targetUserId,
  targetUsername,
  initialIsFollowing,
  initialFollowerCount,
  onFollowerCountChange,
}: ProfileFollowButtonProps) {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);
  const [loading, setLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (authStatus !== "authenticated" || !session?.user) {
      const callbackUrl = `/profiles/${targetUsername}?action=follow`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (session.user.id === targetUserId) return;

    setLoading(true);
    const nextAction = isFollowing ? "unfollow" : "follow";

    try {
      const res = await fetch("/api/v1/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action: nextAction }),
      });
      const json = await res.json();

      if (json.success) {
        const newStatus = !isFollowing;
        setIsFollowing(newStatus);
        const newCount = newStatus ? followerCount + 1 : Math.max(0, followerCount - 1);
        setFollowerCount(newCount);
        if (onFollowerCountChange) onFollowerCountChange(newCount);

        if (newStatus) {
          toast.success(`You are now following @${targetUsername}`, "Followed");
        } else {
          toast.info(`Unfollowed @${targetUsername}`, "Unfollowed");
        }
      } else {
        toast.error(json.error || "Failed to update follow status", "Error");
      }
    } catch (err) {
      toast.error("Failed to update follow status.", "Network Error");
    } finally {
      setLoading(false);
    }
  };

  if (session?.user?.id === targetUserId) return null;

  return (
    <button
      type="button"
      onClick={handleFollowToggle}
      disabled={loading}
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
        isFollowing
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserCheck className="w-4 h-4 text-emerald-600" />
          <span>Following</span>
        </>
      ) : (
        <>
          <UserPlus className="w-4 h-4" />
          <span>Follow</span>
        </>
      )}
    </button>
  );
}
