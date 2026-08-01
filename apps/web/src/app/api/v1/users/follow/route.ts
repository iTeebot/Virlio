import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { followRepository, userRepository } from "@/server/repositories";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/users/follow?targetUserId=...
 * Check follow status and follower count for a given user
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("targetUserId");

    if (!targetUserId) {
      return apiError("Missing targetUserId parameter", 400);
    }

    const session = await authService.getCurrentSession();
    let isFollowing = false;

    if (session?.user?.id && session.user.id !== targetUserId) {
      isFollowing = await followRepository.isFollowing(session.user.id, targetUserId, "user");
    }

    const followerCount = await followRepository.getFollowerCount(targetUserId);

    return apiSuccess({
      isFollowing,
      followerCount,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to check follow status", 500);
  }
}

/**
 * POST /api/v1/users/follow
 * Follow or unfollow a user
 * Body: { targetUserId: string, action?: "follow" | "unfollow" }
 */
export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) {
      return apiUnauthorized("You must be signed in to follow users.");
    }

    const body = await req.json();
    const { targetUserId, action = "follow" } = body;

    if (!targetUserId) {
      return apiError("Missing targetUserId", 400);
    }

    if (session.user.id === targetUserId) {
      return apiError("You cannot follow yourself.", 400);
    }

    const targetUser = await userRepository.findById(targetUserId);
    if (!targetUser) {
      return apiError("User not found", 404);
    }

    if (action === "unfollow") {
      await followRepository.unfollow(session.user.id, targetUserId, "user");
    } else {
      await followRepository.follow(session.user.id, targetUserId, "user");
      const { activityEngine } = await import("@/server/services/activity-engine.service");
      await activityEngine.recordActivity(session.user.id, "followed_user", "user", targetUserId).catch(() => null);
    }

    const isFollowing = action !== "unfollow";
    const followerCount = await followRepository.getFollowerCount(targetUserId);

    return apiSuccess({
      success: true,
      isFollowing,
      followerCount,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to update follow status", 500);
  }
}
