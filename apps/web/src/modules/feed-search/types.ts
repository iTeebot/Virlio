/**
 * Architecture Interface Contract for module: feed-search
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface FeedSearchConfig {
  id: string;
  moduleName: "feed-search";
  enabled: boolean;
  version: string;
}

export type FeedSearchStatus = "active" | "archived" | "draft";
