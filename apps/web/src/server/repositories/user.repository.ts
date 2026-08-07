import { db } from "@virlio/database";
import { users, templates } from "@virlio/database/schema";
import { eq, isNull, desc, and, sql } from "drizzle-orm";
import type { User } from "@virlio/database/types";

/**
 * Find user by ID
 */
export async function findById(id: string) {
  const result = await db.query.users.findFirst({
    where: and(eq(users.id, id), isNull(users.deleted_at)),
  });
  return result || null;
}

/**
 * Find user by email
 */
export async function findByEmail(email: string) {
  const result = await db.query.users.findFirst({
    where: and(eq(users.email, email), isNull(users.deleted_at)),
  });
  return result || null;
}

/**
 * Find user by username
 */
export async function findByUsername(username: string) {
  const result = await db.query.users.findFirst({
    where: and(eq(users.username, username), isNull(users.deleted_at)),
  });
  return result || null;
}

/**
 * Create a new user
 */
export async function create(data: Partial<User>) {
  const [user] = await db.insert(users).values(data as any).returning();
  return user;
}

/**
 * Update an existing user
 */
export async function update(id: string, data: Partial<User>) {
  const [user] = await db
    .update(users)
    .set({ ...data, updated_at: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

/**
 * Soft delete user
 */
export async function softDelete(id: string) {
  const [user] = await db
    .update(users)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

/**
 * Find public profiles with dynamically computed contribution score
 */
export async function findPublicProfiles(options: { limit?: number; offset?: number; sort?: string }) {
  const limit = options.limit || 10;
  const offset = options.offset || 0;

  const rawProfiles = await db.query.users.findMany({
    where: isNull(users.deleted_at),
    limit: 50,
    with: {
      userBadges: {
        columns: {
          badge_id: true,
        },
      },
    },
  });

  const { userStatsEngine } = await import("@/server/services/user-stats-engine.service");

  const enriched = await Promise.all(
    rawProfiles.map(async (u) => {
      try {
        const stats = await userStatsEngine.getUserStatistics(u.id);
        const unlockedAchievementsCount = (stats.achievements || []).filter((a: any) => a.unlocked).length;
        const totalBadgesCount = Math.max(
          (stats.badges || []).length,
          unlockedAchievementsCount,
          (u.userBadges || []).length
        );

        return {
          ...u,
          trust_score: stats.trustScore,
          contributor_score: stats.xp,
          current_streak: stats.currentStreak,
          longest_streak: stats.longestStreak,
          level: stats.level,
          badges_count: totalBadgesCount,
          unlocked_badges_count: totalBadgesCount,
        };
      } catch {
        return {
          ...u,
          badges_count: (u.userBadges || []).length,
          unlocked_badges_count: (u.userBadges || []).length,
        };
      }
    })
  );

  enriched.sort((a, b) => (b.contributor_score || 0) - (a.contributor_score || 0));

  return enriched.slice(offset, offset + limit);
}

/**
 * Update last seen timestamp
 */
export async function updateLastSeen(id: string) {
  await db
    .update(users)
    .set({ last_seen_at: new Date() })
    .where(eq(users.id, id));
}

/**
 * Single-query SQL aggregation for user totals (templates, memes, brands)
 */
export async function getAggregatedUserCounts(userId: string) {
  const result: any = await db.execute(sql`
    SELECT
      (SELECT COUNT(*) FROM brands WHERE owner_id = ${userId})::int AS brands_owned,
      (SELECT COUNT(*) FROM brands WHERE owner_id = ${userId} AND LOWER(verification_status) = 'verified')::int AS verified_brands,
      (SELECT COUNT(*) FROM templates WHERE uploaded_by = ${userId} AND deleted_at IS NULL)::int AS total_templates,
      (SELECT COUNT(*) FROM templates WHERE uploaded_by = ${userId} AND moderation_status = 'approved' AND deleted_at IS NULL)::int AS approved_templates,
      (SELECT COALESCE(SUM(upvotes_count), 0) FROM templates WHERE uploaded_by = ${userId} AND deleted_at IS NULL)::int AS template_upvotes,
      (SELECT COUNT(*) FROM memes WHERE generator_id = ${userId} AND deleted_at IS NULL)::int AS total_memes,
      (SELECT COALESCE(SUM(engagement_score), 0) FROM memes WHERE generator_id = ${userId} AND deleted_at IS NULL)::int AS meme_upvotes
  `);

  const row = (result.rows?.[0] || result[0] || {}) as any;
  return {
    brands_owned: Number(row.brands_owned || 0),
    verified_brands: Number(row.verified_brands || 0),
    total_templates: Number(row.total_templates || 0),
    approved_templates: Number(row.approved_templates || 0),
    template_upvotes: Number(row.template_upvotes || 0),
    total_memes: Number(row.total_memes || 0),
    meme_upvotes: Number(row.meme_upvotes || 0),
  };
}
