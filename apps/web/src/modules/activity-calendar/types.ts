/**
 * Architecture Interface Contract for module: activity-calendar
 * Strict Architectural Spec - No runtime logic implementation.
 */

export interface ActivityCalendarConfig {
  id: string;
  moduleName: "activity-calendar";
  enabled: boolean;
  version: string;
}

export type ActivityCalendarStatus = "active" | "archived" | "draft";
