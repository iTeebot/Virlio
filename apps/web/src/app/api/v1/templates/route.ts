import { NextRequest } from "next/server";
import { templateService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { uploadTemplateSchema } from "@/lib/validations/template";
import { z } from "zod";

import { db } from "@virlio/database";
import { votes } from "@virlio/database/schema";
import { eq, and, inArray } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const query = searchParams.get("query");
    const category = searchParams.get("category") || undefined;
    const mine = searchParams.get("mine") === "true";

    const session = await authService.getCurrentSession();

    if (mine) {
      if (!session?.user?.id) return apiUnauthorized("Session required to view your uploaded templates");
      const userTemplates = await templateService.getContributorTemplates(session.user.id, { limit, offset });
      return apiSuccess(userTemplates);
    }

    let templatesList = query
      ? await templateService.search(query, { limit, offset })
      : await templateService.getPublicTemplates({ limit, offset, category });

    if (session?.user?.id && Array.isArray(templatesList) && templatesList.length > 0) {
      const templateIds = templatesList.map((t: any) => t.id);
      const userVotesList = await db.query.votes.findMany({
        where: and(
          eq(votes.entity_type, "template"),
          eq(votes.user_id, session.user.id),
          inArray(votes.entity_id, templateIds)
        ),
      });
      const voteMap = new Map<string, "upvote" | "downvote">(
        userVotesList.map((v) => [v.entity_id, v.vote_type as "upvote" | "downvote"])
      );

      templatesList = templatesList.map((t: any) => {
        const userVote = voteMap.get(t.id) || null;
        return {
          ...t,
          currentUserVote: userVote,
          user_vote: userVote,
          user_has_voted: userVote !== null,
        };
      });
    }

    return apiSuccess(templatesList);
  } catch (error: any) {
    console.error("[GET /api/v1/templates Error]", error);
    return apiError(error.message || "Failed to fetch templates", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = uploadTemplateSchema.parse(body);

    const template = await templateService.upload(session.user.id, parsed);
    return apiSuccess(template, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to upload template", 500);
  }
}
