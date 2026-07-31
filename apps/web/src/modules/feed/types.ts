/**
 * Architecture Interface Contract for module: feed
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface FeedConfig {
  id: string;
  moduleName: "feed";
  enabled: boolean;
  version: string;
}

export type FeedStatus = "active" | "archived" | "draft";
