import { NextRequest } from "next/server";
import { authService, authorizationService, memeEngineService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { z } from "zod";

export const dynamic = "force-dynamic";

const regenerateMemeSchema = z.object({
  brand_id: z.string().uuid(),
  topic: z.string().min(1).max(500),
  meme_ids: z.array(z.string().uuid()).min(1),
});

/**
 * POST /api/v1/memes/generate/[id]/regenerate
 *
 * Regenerates a list of selected memes in a specific generation batch.
 * The old memes are soft-deleted, and new candidate memes are generated.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: generationId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) {
      return apiUnauthorized();
    }

    const body = await req.json();
    const parsed = regenerateMemeSchema.parse(body);

    // Enforce authorization
    const authCheck = await authorizationService.canCreateMeme(
      session.user.id,
      parsed.brand_id
    );

    if (!authCheck.allowed) {
      return apiError(authCheck.message, 403);
    }

    // Call regeneration engine
    const result = await memeEngineService.regenerateMemes(
      generationId,
      parsed.meme_ids,
      session.user.id,
      parsed.brand_id,
      parsed.topic
    );

    return apiSuccess(result, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiValidationError(error.issues);
    }
    console.error("[POST /api/v1/memes/generate/[id]/regenerate Error]", error);
    return apiError(error.message || "Failed to regenerate memes", 500);
  }
}
