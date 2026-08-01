import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { userAnalyticsEngine } from "@/server/services/xp-engine.service";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    // 1. Recalculate caller's analytics
    const userAnalytics = await userAnalyticsEngine.recalculateUserAnalytics(session.user.id);

    // 2. If user is ADMIN or requested batch repair, run batch repair across all database users
    const body = await req.json().catch(() => ({}));
    let batchResult = null;

    if (body?.batchAll || (session.user as any)?.role === "ADMIN") {
      batchResult = await userAnalyticsEngine.batchRecalculateAllUsers();
    }

    return apiSuccess({
      recalculated: true,
      userAnalytics,
      batchResult,
    });
  } catch (error: any) {
    console.error("Recalculate Analytics Error:", error);
    return apiError(error.message || "Failed to recalculate user analytics", 500);
  }
}
