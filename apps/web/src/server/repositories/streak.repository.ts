import { db } from "@virlio/database";
import { streaks } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

export async function findByUser(userId: string) {
  return db.query.streaks.findMany({ where: eq(streaks.user_id, userId) });
}

export async function findByUserAndCategory(userId: string, category: any) {
  return (await db.query.streaks.findFirst({ where: and(eq(streaks.user_id, userId), eq(streaks.category, category)) })) || null;
}

export async function incrementStreak(userId: string, category: any) {
  const existing = await findByUserAndCategory(userId, category);
  if (existing) {
    const newStreak = (existing.current_streak || 0) + 1;
    const newLongest = Math.max(newStreak, existing.longest_streak || 0);
    const [s] = await db
      .update(streaks)
      .set({ current_streak: newStreak, longest_streak: newLongest, last_activity_date: new Date(), updated_at: new Date() })
      .where(eq(streaks.id, existing.id))
      .returning();
    return s;
  } else {
    const [s] = await db
      .insert(streaks)
      .values({ user_id: userId, category, current_streak: 1, longest_streak: 1, last_activity_date: new Date() })
      .returning();
    return s;
  }
}

export async function resetStreak(userId: string, category: any) {
  const [s] = await db
    .update(streaks)
    .set({ current_streak: 0, updated_at: new Date() })
    .where(and(eq(streaks.user_id, userId), eq(streaks.category, category)))
    .returning();
  return s;
}

export async function freezeStreak(userId: string, category: any, until: Date) {
  const [s] = await db
    .update(streaks)
    .set({ frozen_until: until, updated_at: new Date() })
    .where(and(eq(streaks.user_id, userId), eq(streaks.category, category)))
    .returning();
  return s;
}
