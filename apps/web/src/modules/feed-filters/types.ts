/**
 * Architecture Interface Contract for module: feed-filters
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface FeedFiltersConfig {
  id: string;
  moduleName: "feed-filters";
  enabled: boolean;
  version: string;
}

export type FeedFiltersStatus = "active" | "archived" | "draft";
