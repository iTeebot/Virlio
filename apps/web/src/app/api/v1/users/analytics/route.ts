import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const userId = session.user.id;
    const stats = await userStatsEngine.getUserStatistics(userId);

    return apiSuccess({
      ...stats,
      // Flatten for backward compatibility with the analytics page
      totalTemplates: stats.templates.total,
      approvedTemplates: stats.templates.approved,
      pendingTemplates: stats.templates.pending,
      templateViews: stats.templates.views,
      templateUpvotes: stats.templates.upvotes,
      templateApprovalRate: stats.templates.approvalRate,
      mostPopularTemplate: stats.templates.mostPopular,
      totalMemes: stats.memes.total,
      publicMemes: stats.memes.public,
      privateMemes: stats.memes.private,
      memeUpvotes: stats.memes.upvotes,
      mostPopularMeme: stats.memes.mostPopular,
      brandsOwned: stats.brands.owned,
      followerCount: stats.followers,
      followingCount: stats.following,
      userBrands: stats.brands.items,
    });
  } catch (error: any) {
    console.error("User Analytics Error:", error);
    return apiError(error.message || "Failed to fetch user analytics", 500);
  }
}
