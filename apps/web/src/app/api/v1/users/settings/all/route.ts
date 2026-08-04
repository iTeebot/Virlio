import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { accountRepository, userRepository } from "@/server/repositories";
import { calculateProfileScore } from "@/lib/services/profile-score.service";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/users/settings/all
 * Centralized endpoint returning all user settings, profile, connected accounts, and trust score in ONE request.
 */
export async function GET() {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const userId = session.user.id;

    // Fetch user profile, connected accounts, and profile score in parallel
    const [userRecord, userAccounts, scoreData] = await Promise.all([
      userRepository.findById(userId),
      accountRepository.findByUserId(userId),
      calculateProfileScore(userId),
    ]);

    if (!userRecord) {
      return apiError("User profile not found", 404);
    }

    const sanitizedAccounts = (userAccounts || []).map((acc) => ({
      provider: acc.provider,
      providerAccountId: acc.providerAccountId,
      type: acc.type,
    }));

    return apiSuccess({
      user: {
        id: userRecord.id,
        name: userRecord.name || "",
        username: userRecord.username || "",
        email: userRecord.email || "",
        bio: userRecord.bio || "",
        country: userRecord.country || "",
        website: userRecord.website || "",
        image: userRecord.image || userRecord.avatar_url || "",
        avatar_url: userRecord.avatar_url || userRecord.image || "",
        emailVerified: Boolean(userRecord.emailVerified),
        account_status: userRecord.account_status,
        role: userRecord.role,
      },
      accounts: sanitizedAccounts,
      profileScore: scoreData,
    });
  } catch (error: any) {
    console.error("[Settings All Data Exception]", error);
    return apiError(error.message || "Failed to fetch settings data", 500);
  }
}
