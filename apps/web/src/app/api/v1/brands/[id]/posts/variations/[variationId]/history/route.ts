import { NextRequest } from "next/server";
import { authService, brandService } from "@/server/services";
import { brandPostRepository } from "@/server/repositories";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; variationId: string }>;
}

/**
 * GET /api/v1/brands/[id]/posts/variations/[variationId]/history
 * Fetch the complete revision lineage tree for a variation.
 */
export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId, variationId } = await context.params;

    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole) {
      return apiError("You do not have access to this brand", 403);
    }

    const variation = await brandPostRepository.findVariationById(variationId);
    if (!variation || variation.brand_id !== brandId) {
      return apiNotFound("Variation not found");
    }

    const { searchParams } = new URL(req.url);
    const versionId = searchParams.get("versionId") || variation.active_version_id;

    if (!versionId) {
      // If no active version, return empty lineage
      return apiSuccess({ lineage: [], versions: [] });
    }

    const lineage = await brandPostRepository.findImageVersionLineage(versionId);
    const allVersions = await brandPostRepository.findImageVersionsByVariation(variationId);

    return apiSuccess({
      variationId,
      activeVersionId: variation.active_version_id,
      lineage,
      versions: allVersions,
    });
  } catch (error: any) {
    console.error("[GET /api/v1/brands/[id]/posts/variations/[variationId]/history Error]", error);
    return apiError(error.message || "Failed to fetch version history", 500);
  }
}
