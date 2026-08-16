import { NextRequest } from "next/server";
import { authService, brandService, brandImageEditingService } from "@/server/services";
import { brandPostRepository } from "@/server/repositories";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { editImageVersionSchema } from "@/lib/validations/brand-posts";
import { validateSafetyAndProfanity } from "@/lib/validations/safety-filter";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; variationId: string }>;
}

/**
 * POST /api/v1/brands/[id]/posts/variations/[variationId]/edit
 * Submit a multi-turn edit instruction on a specific image version.
 */
export async function POST(req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId, variationId } = await context.params;

    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole || userRole === "viewer") {
      return apiError("You do not have permission to edit posts for this brand", 403);
    }

    const variation = await brandPostRepository.findVariationById(variationId);
    if (!variation || variation.brand_id !== brandId) {
      return apiNotFound("Variation not found");
    }

    const body = await req.json();
    const parsed = editImageVersionSchema.parse(body);

    // Safety check on edit instruction
    const safetyCheck = validateSafetyAndProfanity(parsed.edit_instruction);
    if (!safetyCheck.isValid) {
      return apiError(`Safety violation in edit instruction: ${safetyCheck.reason}`, 400);
    }

    // Execute precision image editing
    const result = await brandImageEditingService.editVariationImage({
      variationId,
      parentVersionId: parsed.parent_version_id,
      editInstruction: parsed.edit_instruction,
      brandId,
      sessionId: variation.session_id,
      aspectRatio: parsed.aspect_ratio,
      preservedElements: parsed.preserved_elements,
    });

    return apiSuccess(result, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiValidationError(error.issues);
    }
    console.error("[POST /api/v1/brands/[id]/posts/variations/[variationId]/edit Error]", error);
    return apiError(error.message || "Failed to edit image variation", 500);
  }
}
