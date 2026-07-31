/**
 * Architecture Interface Contract for module: followers
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface FollowersConfig {
  id: string;
  moduleName: "followers";
  enabled: boolean;
  version: string;
}

export type FollowersStatus = "active" | "archived" | "draft";
