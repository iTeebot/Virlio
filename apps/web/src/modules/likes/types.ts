/**
 * Architecture Interface Contract for module: likes
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface LikesConfig {
  id: string;
  moduleName: "likes";
  enabled: boolean;
  version: string;
}

export type LikesStatus = "active" | "archived" | "draft";
