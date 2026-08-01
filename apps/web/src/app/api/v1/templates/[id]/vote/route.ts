import { NextRequest } from "next/server";
import { authService, voteService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { eq, and, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized("Must be logged in to vote");

    const { id: paramIdentifier } = await params;
    const body = await req.json();
    const voteType: "upvote" | "downvote" = body.voteType === "downvote" ? "downvote" : "upvote";

    // 1. Resolve template by UUID or Slug
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(paramIdentifier);
    const condition = isUuid ? eq(templates.id, paramIdentifier) : eq(templates.slug, paramIdentifier);

    const targetTemplate = await db.query.templates.findFirst({
      where: and(isNull(templates.deleted_at), condition),
    });

    if (!targetTemplate) {
      return apiNotFound("Template not found");
    }

    // 2. Perform atomic voting inside database transaction
    const result = await voteService.voteTemplate(session.user.id, targetTemplate.id, voteType);

    return apiSuccess(result);
  } catch (error: any) {
    return apiError(error.message || "Failed to vote on template", 500);
  }
}

