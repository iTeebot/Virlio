import { NextRequest } from "next/server";
import { userRepository } from "@/server/repositories";
import { authService } from "@/server/services";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const profiles = await userRepository.findPublicProfiles({ limit, offset });
  return apiSuccess(profiles);
});

export const PATCH = withErrorHandling(async (req: NextRequest) => {
  const session = await authService.getCurrentSession();
  if (!session?.user?.id) return apiUnauthorized();

  const body = await req.json();
  const { name, username, bio, country, website, language } = body;

  const updateData: Record<string, any> = {};

  if (name !== undefined) updateData.name = name.trim();
  if (bio !== undefined) updateData.bio = bio.trim();
  if (country !== undefined) updateData.country = country.trim();
  if (website !== undefined) updateData.website = website.trim();
  if (language !== undefined) updateData.language = language.trim();
  if (body.image !== undefined) {
    updateData.image = body.image.trim();
    updateData.avatar_url = body.image.trim();
  }
  if (body.avatar_url !== undefined) {
    updateData.avatar_url = body.avatar_url.trim();
    if (!updateData.image) updateData.image = body.avatar_url.trim();
  }

  if (username !== undefined && username.trim()) {
    const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleanUsername.length < 3) {
      return apiError("Username must be at least 3 characters.", 400);
    }
    // Check if username is taken by another user
    const existing = await userRepository.findByUsername(cleanUsername);
    if (existing && existing.id !== session.user.id) {
      return apiError("Username is already taken by another creator.", 400);
    }
    updateData.username = cleanUsername;
  }

  const updatedUser = await userRepository.update(session.user.id, updateData);

  // Recalculate stats & trust score after profile changes
  const { userStatsEngine } = await import("@/server/services/user-stats-engine.service");
  await userStatsEngine.getUserStatistics(session.user.id).catch(() => null);

  const { activityEngine } = await import("@/server/services/activity-engine.service");
  await activityEngine.recordActivity(session.user.id, "profile_updated").catch(() => null);

  return apiSuccess(updatedUser);
});
