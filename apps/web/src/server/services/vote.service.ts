import { voteRepository } from "../repositories";

export async function voteTemplate(userId: string, templateId: string, voteType: "upvote" | "downvote") {
  return voteRepository.processTemplateVote(userId, templateId, voteType);
}

export async function vote(userId: string, entityType: string, entityId: string, voteType: "upvote" | "downvote") {
  if (entityType === "template") {
    return voteTemplate(userId, entityId, voteType);
  }

  const existingVote = await voteRepository.getUserVote(entityType, entityId, userId);

  if (existingVote && (existingVote as any).vote_type === voteType) {
    // Toggle off if clicking the same vote type again
    await voteRepository.removeVote(entityType, entityId, userId);
    return { status: "removed" };
  }

  await voteRepository.upsertVote(entityType, entityId, userId, voteType);
  return { status: "voted", voteType };
}

export async function removeVote(userId: string, entityType: string, entityId: string) {
  return voteRepository.removeVote(entityType, entityId, userId);
}

export async function getEntityVotes(entityType: string, entityId: string) {
  return voteRepository.getVoteCounts(entityType, entityId);
}

