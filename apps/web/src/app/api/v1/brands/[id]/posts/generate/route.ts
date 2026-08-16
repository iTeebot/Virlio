import { NextRequest } from "next/server";
import { authService, brandService } from "@/server/services";
import { brandPostEngineService, brandImageSynthesisService, brandVisualProfileService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { generatePostBatchSchema } from "@/lib/validations/brand-posts";
import { validateSafetyAndProfanity } from "@/lib/validations/safety-filter";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/brands/[id]/posts/generate
 * Generates 4 distinct creative variations and synthesizes diffusion images.
 */
export async function POST(req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId } = await context.params;

    // Verify brand access
    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole || userRole === "viewer") {
      return apiError("You do not have permission to generate posts for this brand", 403);
    }

    const body = await req.json();
    const parsed = generatePostBatchSchema.parse(body);

    const effectivePrompt = (parsed.user_prompt || "").trim() ||
      "Create an engaging branded social post showcasing our core value proposition, key offerings, and brand personality.";

    // Safety and profanity check on prompt if provided
    if (parsed.user_prompt?.trim()) {
      const safetyCheck = validateSafetyAndProfanity(parsed.user_prompt);
      if (!safetyCheck.isValid) {
        return apiError(`Safety violation in prompt: ${safetyCheck.reason}`, 400);
      }
    }

    // 1. Stage 1: Generate 4 Distinct Creative Concepts
    const conceptResult = await brandPostEngineService.generatePostVariations({
      sessionId: parsed.session_id,
      brandId,
      userId: session.user.id,
      userPrompt: effectivePrompt,
      campaignGoal: parsed.campaign_goal || undefined,
      targetAudience: parsed.target_audience || undefined,
      targetPlatform: parsed.target_platform,
      aspectRatio: parsed.aspect_ratio,
      toneOverride: parsed.tone_override || undefined,
      selectedProduct: parsed.selected_product || undefined,
      selectedService: parsed.selected_service || undefined,
    });

    // 2. Stage 2 (Optional / Default True): Auto-synthesize Diffusion Images for all 4 variations
    let synthesizedImages: any[] = [];
    if (parsed.auto_synthesize_images && conceptResult.variations.length > 0) {
      const visualProfile = await brandVisualProfileService.getBrandVisualProfile(brandId);

      const synthesisItems = conceptResult.variations.map((v: any) => ({
        variationId: v.id,
        diffusionPrompt: `${v.concept_description}. High aesthetic, solid colors (${visualProfile.colors.primary}), commercial studio quality.`,
        conceptTitle: v.concept_title,
        headlineText: v.headline_text,
        creativeDirection: v.creative_direction,
      }));

      synthesizedImages = await brandImageSynthesisService.synthesizeBatchVariationImages(
        synthesisItems,
        {
          brandId,
          brandName: visualProfile.brandName,
          sessionId: parsed.session_id,
          aspectRatio: parsed.aspect_ratio,
          brandColors: [
            visualProfile.colors.primary,
            visualProfile.colors.secondary,
            visualProfile.colors.accent,
            visualProfile.colors.darkBackground,
          ],
        }
      );
    }

    return apiSuccess(
      {
        ...conceptResult,
        synthesizedImages,
      },
      201
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiValidationError(error.issues);
    }
    console.error("[POST /api/v1/brands/[id]/posts/generate Error]", error);
    return apiError(error.message || "Failed to generate brand post variations", 500);
  }
}
