"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();

  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [followerCount, setFollowerCount] = useState(initialFollowerCount);

  const followMutation = useMutation({
    mutationFn: async (nextAction: "follow" | "unfollow") => {
      const res = await fetch("/api/v1/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, action: nextAction }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to toggle follow status");
      return json;
    },
    onMutate: async (nextAction) => {
      // Optimistic UI Update
      const prevIsFollowing = isFollowing;
      const prevCount = followerCount;

      const newStatus = nextAction === "follow";
      const newCount = newStatus ? prevCount + 1 : Math.max(0, prevCount - 1);

      setIsFollowing(newStatus);
      setFollowerCount(newCount);
      if (onFollowerCountChange) onFollowerCountChange(newCount);

      return { prevIsFollowing, prevCount };
    },
    onError: (err, _nextAction, context) => {
      // Rollback on Error
      if (context) {
        setIsFollowing(context.prevIsFollowing);
        setFollowerCount(context.prevCount);
        if (onFollowerCountChange) onFollowerCountChange(context.prevCount);
      }
      toast.error(err.message || "Failed to update follow status", "Error");
    },
    onSuccess: (_data, nextAction) => {
      queryClient.invalidateQueries({ queryKey: ["profile", targetUsername] });
      queryClient.invalidateQueries({ queryKey: ["community"] });

      if (nextAction === "follow") {
        toast.success(`You are now following @${targetUsername}`, "Followed");
      } else {
        toast.info(`Unfollowed @${targetUsername}`, "Unfollowed");
      }
    },
  });

  const handleFollowToggle = async () => {
    if (authStatus !== "authenticated" || !session?.user) {
      const callbackUrl = `/profiles/${targetUsername}?action=follow`;
      router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    if (session.user.id === targetUserId || followMutation.isPending) return;

    const nextAction = isFollowing ? "unfollow" : "follow";
    followMutation.mutate(nextAction);
  };

  if (session?.user?.id === targetUserId) return null;

  return (
    <button
      type="button"
      onClick={handleFollowToggle}
      disabled={followMutation.isPending}
      className={`inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
        isFollowing
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
          : "bg-blue-600 hover:bg-blue-700 text-white"
      }`}
    >
      {followMutation.isPending ? (
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
