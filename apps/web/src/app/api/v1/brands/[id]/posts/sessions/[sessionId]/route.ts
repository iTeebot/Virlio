import { NextRequest } from "next/server";
import { authService, brandService } from "@/server/services";
import { brandPostRepository } from "@/server/repositories";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string; sessionId: string }>;
}

/**
 * GET /api/v1/brands/[id]/posts/sessions/[sessionId]
 * Fetch complete generation session with full relational graph.
 */
export async function GET(_req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId, sessionId } = await context.params;

    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole) {
      return apiError("You do not have access to this brand", 403);
    }

    const sessionData = await brandPostRepository.findSessionWithDetails(sessionId);
    if (!sessionData || sessionData.brand_id !== brandId) {
      return apiNotFound("Generation session not found");
    }

    return apiSuccess(sessionData);
  } catch (error: any) {
    console.error("[GET /api/v1/brands/[id]/posts/sessions/[sessionId] Error]", error);
    return apiError(error.message || "Failed to fetch session details", 500);
  }
}

/**
 * DELETE /api/v1/brands/[id]/posts/sessions/[sessionId]
 * Soft delete a creative generation session.
 */
export async function DELETE(_req: NextRequest, context: RouteParams) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { id: brandId, sessionId } = await context.params;

    const userRole = await brandService.getUserRole(brandId, session.user.id);
    if (!userRole || userRole === "viewer") {
      return apiError("You do not have permission to delete this session", 403);
    }

    const existing = await brandPostRepository.findSessionById(sessionId);
    if (!existing || existing.brand_id !== brandId) {
      return apiNotFound("Generation session not found");
    }

    const deleted = await brandPostRepository.softDeleteSession(sessionId);
    return apiSuccess({ deleted: true, sessionId: deleted?.id });
  } catch (error: any) {
    console.error("[DELETE /api/v1/brands/[id]/posts/sessions/[sessionId] Error]", error);
    return apiError(error.message || "Failed to delete session", 500);
  }
}
