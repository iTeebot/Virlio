import { db } from "@virlio/database";
import { xpEvents, userLevels } from "@virlio/database/schema";
import { eq, desc } from "drizzle-orm";

export async function addXP(userId: string, amount: number, reason: string, sourceType?: any, sourceId?: string) {
  const [event] = await db
    .insert(xpEvents)
    .values({
      user_id: userId,
      amount,
      reason,
      source_entity_type: sourceType || null,
      source_entity_id: sourceId || null,
    })
    .returning();
  return event;
}

export async function getUserLevel(userId: string) {
  return (await db.query.userLevels.findFirst({ where: eq(userLevels.user_id, userId) })) || null;
}

export async function getXPHistory(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.xpEvents.findMany({
    where: eq(xpEvents.user_id, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(xpEvents.created_at),
  });
}

export async function updateLevel(userId: string, level: number, currentXp: number, lifetimeXp: number, nextLevelXp: number) {
  const [ul] = await db
    .insert(userLevels)
    .values({
      user_id: userId,
      current_level: level,
      current_xp: currentXp,
      lifetime_xp: lifetimeXp,
      next_level_xp: nextLevelXp,
    })
    .onConflictDoUpdate({
      target: userLevels.user_id,
      set: {
        current_level: level,
        current_xp: currentXp,
        lifetime_xp: lifetimeXp,
        next_level_xp: nextLevelXp,
        updated_at: new Date(),
      },
    })
    .returning();
  return ul;
}
