import { NextRequest } from "next/server";
import { exploreService } from "@/server/services";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const [trendingMemes, featuredBrands, popularTemplates, topContributors, recentActivity] = await Promise.all([
      exploreService.getTrendingMemes(limit),
      exploreService.getFeaturedBrands(limit),
      exploreService.getPopularTemplates(limit),
      exploreService.getTopContributors(limit),
      exploreService.getRecentActivity(limit),
    ]);

    return apiSuccess({
      trendingMemes,
      featuredBrands,
      popularTemplates,
      topContributors,
      recentActivity,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch explore feed", 500);
  }
}
