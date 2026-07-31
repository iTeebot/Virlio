/**
 * Architecture Interface Contract for module: favorites
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface FavoritesConfig {
  id: string;
  moduleName: "favorites";
  enabled: boolean;
  version: string;
}

export type FavoritesStatus = "active" | "archived" | "draft";
