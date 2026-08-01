import { db } from "@virlio/database";
import { activities, streaks } from "@virlio/database/schema";
import { eq, desc, and, gte, sql } from "drizzle-orm";
import { activityRepository, streakRepository } from "@/server/repositories";

// ─────────────────────────────────────────────────────────────
// HUMAN-READABLE LABELS FOR ACTIVITY EVENTS
// ─────────────────────────────────────────────────────────────
const ACTIVITY_LABELS: Record<string, string> = {
  joined: "Joined Virlio Community",
  brand_created: "Created Brand Workspace",
  brand_verified: "Brand Verified Successfully",
  brand_updated: "Updated Brand Profile",
  brand_rejected: "Brand Verification Rejected",
  meme_generated: "Generated Meme via AI Studio",
  meme_published: "Published Meme to Community",
  meme_deleted: "Deleted Meme",
  template_uploaded: "Uploaded Meme Template",
  template_approved: "Template Approved by Moderators",
  template_rejected: "Template Rejected by Moderators",
  template_deleted: "Deleted Template",
  badge_earned: "Earned Community Badge",
  achievement_unlocked: "Unlocked Achievement",
  level_up: "Reached New XP Level",
  streak_milestone: "Streak Milestone Reached",
  followed_user: "Followed a Creator",
  followed_brand: "Followed a Brand",
  profile_completed: "Completed Profile Setup",
  profile_updated: "Updated Profile Information",
  team_member_added: "Added Team Member to Brand",
  team_member_removed: "Removed Team Member from Brand",
  social_account_connected: "Connected Social Account",
  email_verified: "Verified Email Address",
  phone_verified: "Verified Phone Number",
  website_verified: "Verified Website Ownership",
  google_business_connected: "Connected Google Business",
  catalog_uploaded: "Uploaded Product Catalog",
  store_photo_uploaded: "Uploaded Storefront Photo",
  document_uploaded: "Uploaded Business Document",
  template_upvoted: "Upvoted a Template",
  template_downvoted: "Downvoted a Template",
  meme_upvoted: "Upvoted a Meme",
  meme_downvoted: "Downvoted a Meme",
};

// ─────────────────────────────────────────────────────────────
// ACTIVITY ICONS (lucide-react component names)
// ─────────────────────────────────────────────────────────────
const ACTIVITY_ICONS: Record<string, string> = {
  joined: "UserPlus",
  brand_created: "Building2",
  brand_verified: "ShieldCheck",
  brand_updated: "Building2",
  meme_generated: "Sparkles",
  meme_published: "Sparkles",
  template_uploaded: "Layers",
  template_approved: "CheckCircle2",
  badge_earned: "Award",
  achievement_unlocked: "Award",
  level_up: "TrendingUp",
  streak_milestone: "Flame",
  followed_user: "UserPlus",
  profile_completed: "User",
  profile_updated: "User",
  email_verified: "Mail",
  website_verified: "Globe",
  social_account_connected: "Link",
};

// ─────────────────────────────────────────────────────────────
// ACTIVITY DOT COLORS
// ─────────────────────────────────────────────────────────────
const ACTIVITY_COLORS: Record<string, string> = {
  brand_created: "bg-blue-600",
  brand_verified: "bg-emerald-600",
  meme_generated: "bg-amber-500",
  template_uploaded: "bg-purple-600",
  template_approved: "bg-emerald-500",
  achievement_unlocked: "bg-amber-600",
  followed_user: "bg-indigo-500",
  email_verified: "bg-emerald-600",
  website_verified: "bg-emerald-600",
  profile_updated: "bg-blue-500",
  joined: "bg-blue-600",
};

export interface ContributionDay {
  date: string; // YYYY-MM-DD
  count: number;
  events: { type: string; label: string; metadata?: any }[];
}

export interface ActivityTimelineEntry {
  id: string;
  type: string;
  label: string;
  icon: string;
  color: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
  created_at: Date;
}

export interface UserActivityStats {
  currentStreak: number;
  longestStreak: number;
  activeDays: number;
  totalContributions: number;
  contributionCalendar: Record<string, ContributionDay>;
  timeline: ActivityTimelineEntry[];
}

// ─────────────────────────────────────────────────────────────
// CENTRALIZED ACTIVITY ENGINE
// ─────────────────────────────────────────────────────────────
export class ActivityEngine {
  /**
   * Record an immutable Activity Event and recalculate streaks.
   */
  async recordActivity(
    userId: string,
    activityType: string,
    entityType?: string,
    entityId?: string,
    metadata?: any,
    timestamp?: Date
  ): Promise<any> {
    try {
      const event = await activityRepository.create({
        user_id: userId,
        activity_type: activityType,
        entity_type: entityType || null,
        entity_id: entityId || null,
        metadata: metadata || {},
        ...(timestamp ? { created_at: timestamp } : {}),
      });

      // Recalculate streaks after every new activity
      await this.calculateStreaksFromEvents(userId).catch(() => null);

      return event;
    } catch (err: any) {
      // If enum value doesn't exist yet (migration pending), log and skip
      console.error(`[ActivityEngine] Failed to record activity '${activityType}' for user ${userId}:`, err.message);
      return null;
    }
  }

  /**
   * Calculate streaks by walking through actual activity event dates.
   * Returns { currentStreak, longestStreak } derived from consecutive calendar days.
   */
  async calculateStreaksFromEvents(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
    // Fetch all activity events for this user
    const allEvents = await db.query.activities.findMany({
      where: eq(activities.user_id, userId),
      orderBy: desc(activities.created_at),
    });

    if (allEvents.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Extract unique calendar days (YYYY-MM-DD) in descending order
    const uniqueDaysSet = new Set<string>();
    for (const event of allEvents) {
      if (event.created_at) {
        const d = new Date(event.created_at);
        const dayKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        uniqueDaysSet.add(dayKey);
      }
    }

    const sortedDays = Array.from(uniqueDaysSet).sort((a, b) => (a > b ? -1 : 1)); // Descending

    if (sortedDays.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    // Calculate current streak: walk backwards from today/yesterday
    const today = new Date();
    const todayKey = this.formatDateKey(today);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = this.formatDateKey(yesterday);

    let currentStreak = 0;
    const hasRecentActivity = uniqueDaysSet.has(todayKey) || uniqueDaysSet.has(yesterdayKey);

    if (hasRecentActivity) {
      const startKey = uniqueDaysSet.has(todayKey) ? todayKey : yesterdayKey;
      let cursor = new Date(startKey + "T12:00:00Z");
      while (true) {
        const key = this.formatDateKey(cursor);
        if (uniqueDaysSet.has(key)) {
          currentStreak++;
          cursor.setDate(cursor.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Calculate longest streak: walk through all sorted days
    let longestStreak = 0;
    let tempStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const currDate = new Date(sortedDays[i - 1] + "T12:00:00Z");
      const prevDate = new Date(sortedDays[i] + "T12:00:00Z");
      const diffMs = currDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    // Persist streak results to the streaks table
    try {
      const existing = await streakRepository.findByUserAndCategory(userId, "community_contribution");
      if (existing) {
        await db
          .update(streaks)
          .set({
            current_streak: currentStreak,
            longest_streak: longestStreak,
            last_activity_date: new Date(),
            updated_at: new Date(),
          })
          .where(eq(streaks.id, existing.id));
      } else {
        await db.insert(streaks).values({
          user_id: userId,
          category: "community_contribution" as any,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_activity_date: new Date(),
        });
      }
    } catch (e) {
      // Non-critical: streak persistence failure
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Get contribution calendar data for a given year.
   * Returns a map of YYYY-MM-DD → { count, events[] }.
   */
  async getContributionCalendar(userId: string, year?: number): Promise<Record<string, ContributionDay>> {
    const targetYear = year || new Date().getFullYear();
    const startDate = new Date(`${targetYear}-01-01T00:00:00Z`);
    const endDate = new Date(`${targetYear + 1}-01-01T00:00:00Z`);

    const events = await db.query.activities.findMany({
      where: and(
        eq(activities.user_id, userId),
        gte(activities.created_at, startDate)
      ),
      orderBy: desc(activities.created_at),
    });

    const calendar: Record<string, ContributionDay> = {};

    for (const event of events) {
      if (!event.created_at || new Date(event.created_at) >= endDate) continue;

      const dateKey = this.formatDateKey(new Date(event.created_at));
      if (!calendar[dateKey]) {
        calendar[dateKey] = { date: dateKey, count: 0, events: [] };
      }
      calendar[dateKey].count++;
      calendar[dateKey].events.push({
        type: event.activity_type,
        label: ACTIVITY_LABELS[event.activity_type] || event.activity_type,
        metadata: event.metadata,
      });
    }

    return calendar;
  }

  /**
   * Get the full activity timeline for a user with human-readable labels.
   */
  async getActivityTimeline(userId: string, limit: number = 20): Promise<ActivityTimelineEntry[]> {
    const events = await activityRepository.findByUser(userId, { limit });

    return events.map((event: any) => ({
      id: event.id,
      type: event.activity_type,
      label: ACTIVITY_LABELS[event.activity_type] || event.activity_type,
      icon: ACTIVITY_ICONS[event.activity_type] || "Activity",
      color: ACTIVITY_COLORS[event.activity_type] || "bg-gray-500",
      entityType: event.entity_type,
      entityId: event.entity_id,
      metadata: event.metadata,
      created_at: event.created_at,
    }));
  }

  /**
   * Get full activity stats: streaks, calendar, timeline, active days, contribution count.
   */
  async getUserActivityStats(userId: string, year?: number): Promise<UserActivityStats> {
    const [streakData, calendar, timeline] = await Promise.all([
      this.calculateStreaksFromEvents(userId),
      this.getContributionCalendar(userId, year),
      this.getActivityTimeline(userId, 20),
    ]);

    const activeDays = Object.keys(calendar).length;
    const totalContributions = Object.values(calendar).reduce((sum, day) => sum + day.count, 0);

    return {
      currentStreak: streakData.currentStreak,
      longestStreak: streakData.longestStreak,
      activeDays,
      totalContributions,
      contributionCalendar: calendar,
      timeline,
    };
  }

  /**
   * Format a Date into YYYY-MM-DD string.
   */
  private formatDateKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }
}

export const activityEngine = new ActivityEngine();
