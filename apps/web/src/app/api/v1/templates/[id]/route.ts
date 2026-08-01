import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { templates, votes } from "@virlio/database/schema";
import { eq, and, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramIdentifier } = await params;

    if (!paramIdentifier) {
      return apiNotFound("Template identifier required");
    }

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(paramIdentifier);

    const condition = isUuid
      ? eq(templates.id, paramIdentifier)
      : eq(templates.slug, paramIdentifier);

    const tpl = await db.query.templates.findFirst({
      where: and(isNull(templates.deleted_at), condition),
      with: {
        uploader: {
          columns: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!tpl) {
      return apiNotFound("Template not found");
    }

    let currentUserVote: "upvote" | "downvote" | null = null;
    const session = await authService.getCurrentSession();

    if (session?.user?.id) {
      const userVoteRow = await db.query.votes.findFirst({
        where: and(
          eq(votes.entity_type, "template"),
          eq(votes.entity_id, tpl.id),
          eq(votes.user_id, session.user.id)
        ),
      });
      if (userVoteRow) {
        currentUserVote = userVoteRow.vote_type as "upvote" | "downvote";
      }
    }

    return apiSuccess({
      ...tpl,
      currentUserVote,
      user_vote: currentUserVote,
      user_has_voted: currentUserVote !== null,
      contributor_username: tpl.uploader?.username || tpl.uploader?.name || "creator",
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch template detail", 500);
  }
}

