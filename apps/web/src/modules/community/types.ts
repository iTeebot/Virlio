/**
 * Architecture Interface Contract for module: community
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface CommunityConfig {
  id: string;
  moduleName: "community";
  enabled: boolean;
  version: string;
}

export type CommunityStatus = "active" | "archived" | "draft";
