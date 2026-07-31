/**
 * Architecture Interface Contract for module: activity
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface ActivityConfig {
  id: string;
  moduleName: "activity";
  enabled: boolean;
  version: string;
}

export type ActivityStatus = "active" | "archived" | "draft";
