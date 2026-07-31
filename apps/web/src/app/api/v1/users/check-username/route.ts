import { NextRequest } from "next/server";
import { userRepository, badgeRepository } from "@/server/repositories";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username")?.trim().toLowerCase();

  if (!username) {
    return apiSuccess({ available: false, reason: "Username is required." });
  }

  if (username.length < 3) {
    return apiSuccess({ available: false, reason: "Username must be at least 3 characters." });
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return apiSuccess({
      available: false,
      reason: "Username can only contain letters, numbers, underscores, and hyphens.",
    });
  }

  // Check database for existing username
  const existingUser = await userRepository.findByUsername(username);

  if (existingUser) {
    // Seed Early Adopter badge for users joining before October 2026
    const cutoffDate = new Date("2026-10-01T00:00:00Z");
    if (new Date() < cutoffDate) {
      await badgeRepository.awardBadgeBySlug(existingUser.id, "early-adopter").catch(() => null);
    }

    const userBadgesList = await badgeRepository.findByUser(existingUser.id).catch(() => []);

    return apiSuccess({
      available: false,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        username: existingUser.username,
        email: existingUser.email,
        image: existingUser.image,
        role: existingUser.role,
        trust_score: existingUser.trust_score,
        contributor_score: existingUser.contributor_score,
        account_status: existingUser.account_status,
        created_at: existingUser.created_at,
        badges: userBadgesList,
      },
      reason: "Username is already taken.",
    });
  }

  return apiSuccess({ available: true, reason: "Username is available!" });
});
