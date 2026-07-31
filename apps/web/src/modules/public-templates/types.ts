/**
 * Architecture Interface Contract for module: public-templates
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface PublicTemplatesConfig {
  id: string;
  moduleName: "public-templates";
  enabled: boolean;
  version: string;
}

export type PublicTemplatesStatus = "active" | "archived" | "draft";
