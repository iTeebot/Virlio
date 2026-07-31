/**
 * Architecture Interface Contract for module: sharing
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface SharingConfig {
  id: string;
  moduleName: "sharing";
  enabled: boolean;
  version: string;
}

export type SharingStatus = "active" | "archived" | "draft";
