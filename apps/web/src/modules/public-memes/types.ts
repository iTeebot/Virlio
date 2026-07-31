/**
 * Architecture Interface Contract for module: public-memes
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface PublicMemesConfig {
  id: string;
  moduleName: "public-memes";
  enabled: boolean;
  version: string;
}

export type PublicMemesStatus = "active" | "archived" | "draft";
