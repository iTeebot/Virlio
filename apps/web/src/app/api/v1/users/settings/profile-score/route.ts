import { authService } from "@/server/services";
import { calculateProfileScore } from "@/lib/services/profile-score.service";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const scoreData = await calculateProfileScore(session.user.id);
    return apiSuccess(scoreData);
  } catch (error: any) {
    return apiError(error.message || "Failed to calculate profile score", 500);
  }
}
