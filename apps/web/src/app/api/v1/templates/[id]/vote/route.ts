import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { votes, templates } from "@virlio/database/schema";
import { eq, and, sql, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized("Must be logged in to vote");

    const { id: paramIdentifier } = await params;
    const body = await req.json();
    const voteType = body.voteType === "downvote" ? "downvote" : "upvote";

    // 1. Resolve template by UUID or Slug
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(paramIdentifier);
    const condition = isUuid ? eq(templates.id, paramIdentifier) : eq(templates.slug, paramIdentifier);

    const targetTemplate = await db.query.templates.findFirst({
      where: and(isNull(templates.deleted_at), condition),
    });

    if (!targetTemplate) {
      return apiNotFound("Template format not found");
    }

    const templateId = targetTemplate.id;

    // 2. Check existing vote
    const existing = await db.query.votes.findFirst({
      where: and(
        eq(votes.entity_type, "template"),
        eq(votes.entity_id, templateId),
        eq(votes.user_id, session.user.id)
      ),
    });

    let newUpvoteCount = targetTemplate.upvotes_count || 0;

    if (existing) {
      if (existing.vote_type === voteType) {
        // Toggle off vote
        await db.delete(votes).where(eq(votes.id, existing.id));
        const delta = voteType === "upvote" ? -1 : 1;
        newUpvoteCount = Math.max(0, newUpvoteCount + (voteType === "upvote" ? -1 : 0));
        await db
          .update(templates)
          .set({
            public_score: sql`${templates.public_score} + ${delta}`,
            upvotes_count: sql`GREATEST(0, ${templates.upvotes_count} + ${voteType === "upvote" ? -1 : 0})`,
          })
          .where(eq(templates.id, templateId));

        return apiSuccess({ voted: false, voteType: null, upvotes_count: newUpvoteCount });
      } else {
        // Update vote type
        await db.update(votes).set({ vote_type: voteType }).where(eq(votes.id, existing.id));
        const delta = voteType === "upvote" ? 2 : -2;
        const upvoteDelta = voteType === "upvote" ? 1 : -1;
        newUpvoteCount = Math.max(0, newUpvoteCount + upvoteDelta);
        await db
          .update(templates)
          .set({
            public_score: sql`${templates.public_score} + ${delta}`,
            upvotes_count: sql`GREATEST(0, ${templates.upvotes_count} + ${upvoteDelta})`,
          })
          .where(eq(templates.id, templateId));

        return apiSuccess({ voted: true, voteType, upvotes_count: newUpvoteCount });
      }
    }

    // Insert new vote
    await db.insert(votes).values({
      entity_type: "template",
      entity_id: templateId,
      user_id: session.user.id,
      vote_type: voteType,
    });

    const delta = voteType === "upvote" ? 1 : -1;
    const upvoteDelta = voteType === "upvote" ? 1 : 0;
    newUpvoteCount = newUpvoteCount + upvoteDelta;

    await db
      .update(templates)
      .set({
        public_score: sql`${templates.public_score} + ${delta}`,
        upvotes_count: sql`${templates.upvotes_count} + ${upvoteDelta}`,
      })
      .where(eq(templates.id, templateId));

    return apiSuccess({ voted: true, voteType, upvotes_count: newUpvoteCount });
  } catch (error: any) {
    return apiError(error.message || "Failed to vote on template", 500);
  }
}
