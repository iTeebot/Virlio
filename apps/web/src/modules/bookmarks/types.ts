/**
 * Architecture Interface Contract for module: bookmarks
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface BookmarksConfig {
  id: string;
  moduleName: "bookmarks";
  enabled: boolean;
  version: string;
}

export type BookmarksStatus = "active" | "archived" | "draft";
