/**
 * Architecture Interface Contract for module: public-contributors
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface PublicContributorsConfig {
  id: string;
  moduleName: "public-contributors";
  enabled: boolean;
  version: string;
}

export type PublicContributorsStatus = "active" | "archived" | "draft";
