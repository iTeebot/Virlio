import { db } from "@virlio/database";
import { votes, templates } from "@virlio/database/schema";
import { eq, and, count, sql, isNull } from "drizzle-orm";

export async function processTemplateVote(
  userId: string,
  templateId: string,
  voteType: "upvote" | "downvote"
) {
  return await db.transaction(async (tx) => {
    // 1. Fetch existing vote row inside transaction
    const existing = await tx.query.votes.findFirst({
      where: and(
        eq(votes.entity_type, "template"),
        eq(votes.entity_id, templateId),
        eq(votes.user_id, userId)
      ),
    });

    let currentUserVote: "upvote" | "downvote" | null = null;

    if (existing) {
      if (existing.vote_type === voteType) {
        // Toggle off vote
        await tx.delete(votes).where(eq(votes.id, existing.id));
        const upvoteDelta = voteType === "upvote" ? -1 : 0;
        const scoreDelta = voteType === "upvote" ? -1 : 1;

        await tx
          .update(templates)
          .set({
            public_score: sql`COALESCE(${templates.public_score}, 0) + ${scoreDelta}`,
            upvotes_count: sql`GREATEST(0, COALESCE(${templates.upvotes_count}, 0) + ${upvoteDelta})`,
          })
          .where(eq(templates.id, templateId));

        currentUserVote = null;
      } else {
        // Switch vote type
        await tx
          .update(votes)
          .set({ vote_type: voteType })
          .where(eq(votes.id, existing.id));

        const upvoteDelta = voteType === "upvote" ? 1 : -1;
        const scoreDelta = voteType === "upvote" ? 2 : -2;

        await tx
          .update(templates)
          .set({
            public_score: sql`COALESCE(${templates.public_score}, 0) + ${scoreDelta}`,
            upvotes_count: sql`GREATEST(0, COALESCE(${templates.upvotes_count}, 0) + ${upvoteDelta})`,
          })
          .where(eq(templates.id, templateId));

        currentUserVote = voteType;
      }
    } else {
      // Insert new vote with unique constraint guard
      await tx
        .insert(votes)
        .values({
          entity_type: "template",
          entity_id: templateId,
          user_id: userId,
          vote_type: voteType,
        })
        .onConflictDoUpdate({
          target: [votes.user_id, votes.entity_type, votes.entity_id],
          set: { vote_type: voteType },
        });

      const upvoteDelta = voteType === "upvote" ? 1 : 0;
      const scoreDelta = voteType === "upvote" ? 1 : -1;

      await tx
        .update(templates)
        .set({
          public_score: sql`COALESCE(${templates.public_score}, 0) + ${scoreDelta}`,
          upvotes_count: sql`GREATEST(0, COALESCE(${templates.upvotes_count}, 0) + ${upvoteDelta})`,
        })
        .where(eq(templates.id, templateId));

      currentUserVote = voteType;
    }

    // 2. Query exact fresh counts directly from transaction
    const updated = await tx.query.templates.findFirst({
      where: eq(templates.id, templateId),
    });

    const upvotes_count = updated?.upvotes_count ?? 0;
    const public_score = updated?.public_score ?? 0;

    return {
      id: templateId,
      upvotes_count,
      public_score,
      currentUserVote,
      likes: upvotes_count,
      dislikes: 0,
      voted: currentUserVote !== null,
      voteType: currentUserVote,
    };
  });
}

export async function upsertVote(entityType: string, entityId: string, userId: string, voteType: "upvote" | "downvote") {
  const [vote] = await db
    .insert(votes)
    .values({
      entity_type: entityType as any,
      entity_id: entityId,
      user_id: userId,
      vote_type: voteType as any,
    })
    .onConflictDoUpdate({
      target: [votes.user_id, votes.entity_type, votes.entity_id],
      set: { vote_type: voteType as any },
    })
    .returning();
  return vote;
}

export async function removeVote(entityType: string, entityId: string, userId: string) {
  await db
    .delete(votes)
    .where(and(eq(votes.entity_type as any, entityType), eq(votes.entity_id, entityId), eq(votes.user_id, userId)));
}

export async function getVoteCounts(entityType: string, entityId: string) {
  const result = await db
    .select({
      voteType: votes.vote_type,
      count: count(),
    })
    .from(votes)
    .where(and(eq(votes.entity_type as any, entityType), eq(votes.entity_id, entityId)))
    .groupBy(votes.vote_type);

  let upvotes = 0;
  let downvotes = 0;
  for (const r of result) {
    if (r.voteType === "upvote") upvotes = r.count;
    if (r.voteType === "downvote") downvotes = r.count;
  }
  return { upvotes, downvotes };
}

export async function getUserVote(entityType: string, entityId: string, userId: string) {
  return (
    (await db.query.votes.findFirst({
      where: and(eq(votes.entity_type as any, entityType), eq(votes.entity_id, entityId), eq(votes.user_id, userId)),
    })) || null
  );
}

