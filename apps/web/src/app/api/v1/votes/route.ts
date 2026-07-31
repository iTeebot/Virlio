import { NextRequest } from "next/server";
import { voteService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { voteSchema } from "@/lib/validations/engagement";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { entity_type, entity_id, vote_type } = voteSchema.parse(body);

    const result = await voteService.vote(session.user.id, entity_type, entity_id, vote_type);
    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to submit vote", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    if (!entityType || !entityId) return apiError("Missing entityType or entityId query parameters", 400);

    await voteService.removeVote(session.user.id, entityType, entityId);
    return apiSuccess({ removed: true });
  } catch (error: any) {
    return apiError(error.message || "Failed to remove vote", 500);
  }
}
