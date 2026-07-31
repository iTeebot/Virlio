/**
 * Architecture Interface Contract for module: public-brands
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface PublicBrandsConfig {
  id: string;
  moduleName: "public-brands";
  enabled: boolean;
  version: string;
}

export type PublicBrandsStatus = "active" | "archived" | "draft";
