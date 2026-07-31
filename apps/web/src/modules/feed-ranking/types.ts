/**
 * Architecture Interface Contract for module: feed-ranking
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface FeedRankingConfig {
  id: string;
  moduleName: "feed-ranking";
  enabled: boolean;
  version: string;
}

export type FeedRankingStatus = "active" | "archived" | "draft";
