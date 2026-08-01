"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "@/components/ui/toast";

export interface TemplateState {
  id: string;
  upvotes_count: number;
  public_score: number;
  currentUserVote: "upvote" | "downvote" | null;
}

interface TemplateContextType {
  templatesById: Record<string, TemplateState>;
  getTemplateState: (id: string) => TemplateState | undefined;
  syncTemplates: (items: Array<{ id: string; upvotes_count?: number; public_score?: number; currentUserVote?: "upvote" | "downvote" | null; user_vote?: "upvote" | "downvote" | null; user_voted?: "up" | "down" | "upvote" | "downvote" | null; user_has_voted?: boolean }>) => void;
  updateTemplateState: (id: string, patch: Partial<TemplateState>) => void;
  performVote: (id: string, voteType: "upvote" | "downvote") => Promise<{ success: boolean; error?: string }>;
  isVotePending: (id: string) => boolean;
}

const TemplateContext = createContext<TemplateContextType | undefined>(undefined);

const BROADCAST_CHANNEL_NAME = "virlio_template_vote_sync";

export function TemplateProvider({ children }: { children: React.ReactNode }) {
  const [templatesById, setTemplatesById] = useState<Record<string, TemplateState>>({});
  const pendingVotesRef = useRef<Set<string>>(new Set());
  const { status } = useSession();
  const router = useRouter();

  // Cross-tab Synchronization using BroadcastChannel
  useEffect(() => {
    if (typeof window === "undefined" || !("BroadcastChannel" in window)) return;

    const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);

    channel.onmessage = (event) => {
      const { type, payload } = event.data || {};
      if (type === "TEMPLATE_VOTE_UPDATED" && payload?.id) {
        setTemplatesById((prev) => {
          const existing = prev[payload.id];
          return {
            ...prev,
            [payload.id]: {
              id: payload.id,
              upvotes_count: payload.upvotes_count ?? existing?.upvotes_count ?? 0,
              public_score: payload.public_score ?? existing?.public_score ?? 0,
              currentUserVote: payload.currentUserVote !== undefined ? payload.currentUserVote : existing?.currentUserVote ?? null,
            },
          };
        });
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const broadcastChange = useCallback((state: TemplateState) => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      try {
        const channel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
        channel.postMessage({ type: "TEMPLATE_VOTE_UPDATED", payload: state });
        channel.close();
      } catch {
        // Ignore BroadcastChannel errors
      }
    }
  }, []);

  const getTemplateState = useCallback((id: string) => {
    return templatesById[id];
  }, [templatesById]);

  const isVotePending = useCallback((id: string) => {
    return pendingVotesRef.current.has(id);
  }, []);

  const syncTemplates = useCallback((items: Array<{ id: string; upvotes_count?: number; public_score?: number; currentUserVote?: "upvote" | "downvote" | null; user_vote?: "upvote" | "downvote" | null; user_voted?: "up" | "down" | "upvote" | "downvote" | null; user_has_voted?: boolean }>) => {
    if (!Array.isArray(items) || items.length === 0) return;

    setTemplatesById((prev) => {
      let changed = false;
      const next = { ...prev };

      for (const item of items) {
        if (!item?.id) continue;
        const existing = next[item.id];

        let resolvedVote: "upvote" | "downvote" | null = null;
        if (item.currentUserVote !== undefined) {
          resolvedVote = item.currentUserVote;
        } else if (item.user_vote !== undefined) {
          resolvedVote = item.user_vote;
        } else if (item.user_voted) {
          resolvedVote = item.user_voted === "up" || item.user_voted === "upvote" ? "upvote" : "downvote";
        } else if (item.user_has_voted) {
          resolvedVote = "upvote";
        } else if (existing?.currentUserVote !== undefined) {
          resolvedVote = existing.currentUserVote;
        }

        const newCount = item.upvotes_count ?? existing?.upvotes_count ?? 0;
        const newScore = item.public_score ?? existing?.public_score ?? 0;

        if (
          !existing ||
          existing.upvotes_count !== newCount ||
          existing.public_score !== newScore ||
          existing.currentUserVote !== resolvedVote
        ) {
          next[item.id] = {
            id: item.id,
            upvotes_count: newCount,
            public_score: newScore,
            currentUserVote: resolvedVote,
          };
          changed = true;
        }
      }

      return changed ? next : prev;
    });
  }, []);

  const updateTemplateState = useCallback((id: string, patch: Partial<TemplateState>) => {
    setTemplatesById((prev) => {
      const existing = prev[id] || { id, upvotes_count: 0, public_score: 0, currentUserVote: null };
      const updated: TemplateState = {
        ...existing,
        ...patch,
      };
      return { ...prev, [id]: updated };
    });
  }, []);

  const performVote = useCallback(
    async (id: string, targetVoteType: "upvote" | "downvote"): Promise<{ success: boolean; error?: string }> => {
      if (status === "unauthenticated") {
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return { success: false, error: "Authentication required" };
      }

      if (pendingVotesRef.current.has(id)) {
        return { success: false, error: "Mutation pending" };
      }

      pendingVotesRef.current.add(id);

      // Snapshot previous state for rollback
      const previousState = templatesById[id] || {
        id,
        upvotes_count: 0,
        public_score: 0,
        currentUserVote: null,
      };

      const currentVote = previousState.currentUserVote;
      let nextVote: "upvote" | "downvote" | null = null;
      let countDelta = 0;

      if (currentVote === targetVoteType) {
        // Toggling off vote
        nextVote = null;
        countDelta = targetVoteType === "upvote" ? -1 : 0;
      } else if (currentVote) {
        // Switching vote type
        nextVote = targetVoteType;
        countDelta = targetVoteType === "upvote" ? 1 : -1;
      } else {
        // New vote
        nextVote = targetVoteType;
        countDelta = targetVoteType === "upvote" ? 1 : 0;
      }

      const optimisticState: TemplateState = {
        id,
        upvotes_count: Math.max(0, previousState.upvotes_count + countDelta),
        public_score: previousState.public_score + (targetVoteType === "upvote" ? 1 : -1),
        currentUserVote: nextVote,
      };

      // Optimistic update
      setTemplatesById((prev) => ({ ...prev, [id]: optimisticState }));
      broadcastChange(optimisticState);

      try {
        const res = await fetch(`/api/v1/templates/${id}/vote`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voteType: targetVoteType }),
        });

        if (res.status === 401) {
          // Rollback
          setTemplatesById((prev) => ({ ...prev, [id]: previousState }));
          broadcastChange(previousState);
          router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
          return { success: false, error: "Unauthorized" };
        }

        if (!res.ok) {
          const json = await res.json();
          throw new Error(json.error || "Failed to submit vote");
        }

        const json = await res.json();
        const serverData = json.data || json;

        const authoritativeState: TemplateState = {
          id,
          upvotes_count: serverData.upvotes_count ?? serverData.likes ?? optimisticState.upvotes_count,
          public_score: serverData.public_score ?? optimisticState.public_score,
          currentUserVote: serverData.currentUserVote !== undefined ? serverData.currentUserVote : serverData.voteType ?? optimisticState.currentUserVote,
        };

        setTemplatesById((prev) => ({ ...prev, [id]: authoritativeState }));
        broadcastChange(authoritativeState);

        return { success: true };
      } catch (err: any) {
        // Automatic Rollback on failure
        setTemplatesById((prev) => ({ ...prev, [id]: previousState }));
        broadcastChange(previousState);
        toast.error(err.message || "Failed to save vote. Rolled back changes.");
        return { success: false, error: err.message };
      } finally {
        pendingVotesRef.current.delete(id);
      }
    },
    [status, router, templatesById, broadcastChange]
  );

  return (
    <TemplateContext.Provider
      value={{
        templatesById,
        getTemplateState,
        syncTemplates,
        updateTemplateState,
        performVote,
        isVotePending,
      }}
    >
      {children}
    </TemplateContext.Provider>
  );
}

export function useTemplateStore() {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error("useTemplateStore must be used within a TemplateProvider");
  }
  return context;
}
