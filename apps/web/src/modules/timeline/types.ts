/**
 * Architecture Interface Contract for module: timeline
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface TimelineConfig {
  id: string;
  moduleName: "timeline";
  enabled: boolean;
  version: string;
}

export type TimelineStatus = "active" | "archived" | "draft";
