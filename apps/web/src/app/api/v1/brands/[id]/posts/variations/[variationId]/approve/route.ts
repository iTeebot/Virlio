import { NextRequest } from "next/server";
import { authService, brandService } from "@/server/services";
import { brandPostRepository } from "@/server/repositories";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { approveVariationSchema } from "@/lib/validations/brand-posts";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; variationId: string }>;
}

/**
 * POST /api/v1/brands/[id]/posts/variations/[variationId]/approve
 * Approve or unapprove a variation as an official finalized brand post asset.
 */
export async function POST(req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId, variationId } = await context.params;

    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole || userRole === "viewer") {
      return apiError("You do not have permission to approve posts for this brand", 403);
    }

    const variation = await brandPostRepository.findVariationById(variationId);
    if (!variation || variation.brand_id !== brandId) {
      return apiNotFound("Variation not found");
    }

    const body = await req.json().catch(() => ({ is_approved: true }));
    const parsed = approveVariationSchema.parse(body);

    const updated = await brandPostRepository.setApproved(variationId, parsed.is_approved);

    return apiSuccess({
      variationId: updated?.id,
      isApproved: updated?.is_approved,
      activeVersionId: updated?.active_version_id,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiValidationError(error.issues);
    }
    console.error("[POST /api/v1/brands/[id]/posts/variations/[variationId]/approve Error]", error);
    return apiError(error.message || "Failed to update variation approval status", 500);
  }
}
