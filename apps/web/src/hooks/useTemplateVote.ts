"use client";

import { useEffect } from "react";
import { useTemplateStore } from "@/providers/template-provider";

export interface UseTemplateVoteInitial {
  upvotes_count?: number;
  public_score?: number;
  currentUserVote?: "upvote" | "downvote" | null;
  user_vote?: "upvote" | "downvote" | null;
  user_voted?: "up" | "down" | "upvote" | "downvote" | null;
  user_has_voted?: boolean;
}

export function useTemplateVote(templateId: string, initial?: UseTemplateVoteInitial) {
  const { templatesById, syncTemplates, performVote, isVotePending } = useTemplateStore();

  useEffect(() => {
    if (templateId && initial) {
      syncTemplates([{ id: templateId, ...initial }]);
    }
  }, [
    templateId,
    initial?.upvotes_count,
    initial?.public_score,
    initial?.currentUserVote,
    initial?.user_vote,
    initial?.user_voted,
    syncTemplates,
  ]);

  const existingState = templatesById[templateId];

  let resolvedVote: "upvote" | "downvote" | null = null;
  if (existingState?.currentUserVote !== undefined) {
    resolvedVote = existingState.currentUserVote;
  } else if (initial?.currentUserVote !== undefined) {
    resolvedVote = initial.currentUserVote;
  } else if (initial?.user_vote !== undefined) {
    resolvedVote = initial.user_vote;
  } else if (initial?.user_voted) {
    resolvedVote = initial.user_voted === "up" || initial.user_voted === "upvote" ? "upvote" : "downvote";
  }

  const upvotesCount = existingState?.upvotes_count ?? initial?.upvotes_count ?? 0;
  const publicScore = existingState?.public_score ?? initial?.public_score ?? 0;
  const isPending = isVotePending(templateId);

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!templateId) return;
    return performVote(templateId, type);
  };

  return {
    upvotesCount,
    publicScore,
    currentUserVote: resolvedVote,
    isLiked: resolvedVote === "upvote",
    isDisliked: resolvedVote === "downvote",
    isPending,
    handleVote,
  };
}
