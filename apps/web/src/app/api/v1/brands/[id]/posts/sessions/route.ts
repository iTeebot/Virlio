import { NextRequest } from "next/server";
import { authService, brandService } from "@/server/services";
import { brandPostRepository } from "@/server/repositories";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { createPostSessionSchema } from "@/lib/validations/brand-posts";
import { z } from "zod";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/brands/[id]/posts/sessions
 * List all creative sessions for a brand.
 */
export async function GET(req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId } = await context.params;

    // Verify user membership in brand
    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole) {
      return apiError("You do not have access to this brand", 403);
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const status = searchParams.get("status") || undefined;

    const sessions = await brandPostRepository.findSessionsByBrand(brandId, {
      limit,
      offset,
      status,
    });

    return apiSuccess({ sessions });
  } catch (error: any) {
    console.error("[GET /api/v1/brands/[id]/posts/sessions Error]", error);
    return apiError(error.message || "Failed to fetch brand post sessions", 500);
  }
}

/**
 * POST /api/v1/brands/[id]/posts/sessions
 * Create a new creative generation session.
 */
export async function POST(req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId } = await context.params;

    // Verify user membership in brand
    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole) {
      return apiError("You do not have permission to create sessions for this brand", 403);
    }

    const body = await req.json();
    const parsed = createPostSessionSchema.parse(body);

    const newSession = await brandPostRepository.createSession({
      brand_id: brandId,
      user_id: session.user.id,
      title: parsed.title,
      focus_type: parsed.focus_type,
      selected_product: parsed.selected_product || null,
      selected_service: parsed.selected_service || null,
      target_platform: parsed.target_platform,
      aspect_ratio: parsed.aspect_ratio,
      status: "active",
    });

    return apiSuccess(newSession, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return apiValidationError(error.issues);
    }
    console.error("[POST /api/v1/brands/[id]/posts/sessions Error]", error);
    return apiError(error.message || "Failed to create generation session", 500);
  }
}
