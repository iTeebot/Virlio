import { NextRequest } from "next/server";
import { memeService, authService, authorizationService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { generateMemeSchema } from "@/lib/validations/meme";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const memes = await memeService.getPublicMemes({ limit, offset });
    return apiSuccess(memes);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch memes", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = generateMemeSchema.parse(body);

    // Enforce Virlio Authorization Rule: Only Verified Brands can create Memes
    const authCheck = await authorizationService.canCreateMeme(
      session.user.id,
      parsed.brand_id,
      parsed.template_id
    );

    if (!authCheck.allowed) {
      return apiError(authCheck.message, 403);
    }

    const meme = await memeService.create(session.user.id, {
      ...parsed,
      brand_id: authCheck.brand.id,
    });
    const { activityEngine } = await import("@/server/services/activity-engine.service");
    await activityEngine.recordActivity(session.user.id, "meme_generated", "meme", meme?.id || undefined, { brand_id: parsed.brand_id }).catch(() => null);
    return apiSuccess(meme, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to create meme", 500);
  }
}
