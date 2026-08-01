import { db } from "@virlio/database";
import { users, templates } from "@virlio/database/schema";
import { eq, isNull, desc, and } from "drizzle-orm";
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

  const enriched = await Promise.all(
    rawProfiles.map(async (u) => {
      try {
        const userTemplates = await db.query.templates.findMany({
          where: eq(templates.uploaded_by, u.id),
        });

        const templateCount = userTemplates.length;
        const totalDownloads = userTemplates.reduce((acc, t) => acc + (t.downloads_count || 0), 0);
        const totalUpvotes = userTemplates.reduce((acc, t) => acc + (t.upvotes_count || 0), 0);

        const computedScore = (templateCount * 50) + (totalDownloads * 2) + (totalUpvotes * 5);
        const finalScore = Math.max(u.contributor_score || 0, computedScore);

        return {
          ...u,
          contributor_score: finalScore,
        };
      } catch {
        return u;
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
