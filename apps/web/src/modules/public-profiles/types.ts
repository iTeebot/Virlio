/**
 * Architecture Interface Contract for module: public-profiles
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface PublicProfilesConfig {
  id: string;
  moduleName: "public-profiles";
  enabled: boolean;
  version: string;
}

export type PublicProfilesStatus = "active" | "archived" | "draft";
