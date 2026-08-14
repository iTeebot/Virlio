import { userService, authService } from "@/server/services";
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

    const profileData = await userService.getCurrentUserProfile(session.user.id);
    if (!profileData) {
      return apiError("User profile not found", 404);
    }

    return apiSuccess({
      user: profileData.user,
      accounts: profileData.accounts,
      profileScore: profileData.profileScore,
    });
  } catch (error: any) {
    console.error("[Settings All Data Exception]", error);
    return apiError(error.message || "Failed to fetch settings data", 500);
  }
}
