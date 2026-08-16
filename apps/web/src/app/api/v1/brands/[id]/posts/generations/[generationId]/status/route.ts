import { NextRequest } from "next/server";
import { authService, brandService } from "@/server/services";
import { brandPostRepository } from "@/server/repositories";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; generationId: string }>;
}

/**
 * GET /api/v1/brands/[id]/posts/generations/[generationId]/status
 * Polling endpoint for generation job progress and variations.
 */
export async function GET(_req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId, generationId } = await context.params;

    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole) {
      return apiError("You do not have access to this brand", 403);
    }

    const generation = await brandPostRepository.findGenerationById(generationId);
    if (!generation || generation.brand_id !== brandId) {
      return apiNotFound("Generation job not found");
    }

    const variations = await brandPostRepository.findVariationsByGeneration(generationId);

    return apiSuccess({
      generationId: generation.id,
      status: generation.status,
      errorMessage: generation.error_message,
      provider: generation.provider_used,
      model: generation.model_used,
      generationTimeMs: generation.generation_time_ms,
      variations,
    });
  } catch (error: any) {
    console.error("[GET /api/v1/brands/[id]/posts/generations/[generationId]/status Error]", error);
    return apiError(error.message || "Failed to fetch generation status", 500);
  }
}
