import { db } from "@virlio/database";
import { notifications } from "@virlio/database/schema";
import { eq, and, desc, isNull, count } from "drizzle-orm";

export async function create(data: any) {
  const [notification] = await db.insert(notifications).values(data).returning();
  return notification;
}

export async function findByUser(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.notifications.findMany({
    where: eq(notifications.user_id, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(notifications.created_at),
  });
}

export async function markRead(id: string) {
  const [n] = await db
    .update(notifications)
    .set({ read_at: new Date() })
    .where(eq(notifications.id, id))
    .returning();
  return n;
}

export async function markAllRead(userId: string) {
  await db
    .update(notifications)
    .set({ read_at: new Date() })
    .where(and(eq(notifications.user_id, userId), isNull(notifications.read_at)));
}

export async function countUnread(userId: string) {
  const res = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.user_id, userId), isNull(notifications.read_at)));
  return res[0]?.count || 0;
}
