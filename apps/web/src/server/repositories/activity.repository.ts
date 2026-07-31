import { db } from "@virlio/database";
import { activities } from "@virlio/database/schema";
import { eq, desc } from "drizzle-orm";

export async function create(data: any) {
  const [activity] = await db.insert(activities).values(data).returning();
  return activity;
}

export async function findByUser(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.activities.findMany({
    where: eq(activities.user_id, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(activities.created_at),
  });
}

export async function findPublic(options: { limit?: number; offset?: number } = {}) {
  return db.query.activities.findMany({
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(activities.created_at),
  });
}

export async function findRecent(limit: number = 10) {
  return findPublic({ limit });
}
