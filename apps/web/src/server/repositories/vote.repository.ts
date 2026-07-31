import { db } from "@virlio/database";
import { votes } from "@virlio/database/schema";
import { eq, and, count } from "drizzle-orm";

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
