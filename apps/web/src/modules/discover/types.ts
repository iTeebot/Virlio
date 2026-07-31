/**
 * Architecture Interface Contract for module: discover
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface DiscoverConfig {
  id: string;
  moduleName: "discover";
  enabled: boolean;
  version: string;
}

export type DiscoverStatus = "active" | "archived" | "draft";
