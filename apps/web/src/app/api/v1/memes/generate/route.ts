import { NextRequest } from "next/server";
import { authService, authorizationService, memeEngineService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { generateMemeBatchSchema } from "@/lib/validations/meme";
import { z } from "zod";

export const dynamic = "force-dynamic";

/**
 * POST /api/v1/memes/generate
 *
 * Generates a batch of branded memes using AI template selection,
 * caption generation, and metadata ranking.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) {
      return apiUnauthorized();
    }

    const body = await req.json();
    const parsed = generateMemeBatchSchema.parse(body);

    // Enforce Virlio Authorization: User must have permission to create memes for this brand
    // and the brand must be verified.
    const authCheck = await authorizationService.canCreateMeme(
      session.user.id,
      parsed.brand_id
    );

    if (!authCheck.allowed) {
      return apiError(authCheck.message, 403);
    }

    // Server-side safety filter validation
    const { validateSafetyAndProfanity } = await import("@/lib/validations/safety-filter");
    const inputsToCheck = [
      { name: "Topic", value: parsed.topic },
      { name: "Campaign Name", value: parsed.campaign_name },
      { name: "Target Audience", value: parsed.target_audience },
      { name: "CTA", value: parsed.cta },
      { name: "Additional Notes", value: parsed.additional_notes },
    ];

    for (const input of inputsToCheck) {
      if (input.value && input.value.trim()) {
        const check = validateSafetyAndProfanity(input.value);
        if (!check.isValid) {
          return apiError(`Safety violation in ${input.name}: ${check.reason}`, 400);
        }
      }
    }

    // Call the Meme Generation Engine to rank templates, select, generate, and persist draft memes.
    const result = await memeEngineService.generateMemes({
      brandId: parsed.brand_id,
      userId: session.user.id,
      topic: parsed.topic,
      count: parsed.count,
      campaignName: parsed.campaign_name || undefined,
      targetAudience: parsed.target_audience || undefined,
      marketingGoal: parsed.marketing_goal || undefined,
      tone: parsed.tone || undefined,
      cta: parsed.cta || undefined,
      additionalNotes: parsed.additional_notes || undefined,
    });

    return apiSuccess(result, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiValidationError(error.issues);
    }
    console.error("[POST /api/v1/memes/generate Error]", error);
    return apiError(error.message || "Failed to generate branded memes", 500);
  }
}
