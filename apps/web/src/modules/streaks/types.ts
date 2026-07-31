/**
 * Architecture Interface Contract for module: streaks
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface StreaksConfig {
  id: string;
  moduleName: "streaks";
  enabled: boolean;
  version: string;
}

export type StreaksStatus = "active" | "archived" | "draft";
