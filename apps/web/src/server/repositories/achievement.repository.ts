import { db } from "@virlio/database";
import { achievements, userAchievements } from "@virlio/database/schema";
import { eq, and, sql } from "drizzle-orm";

export async function findAll() {
  return db.query.achievements.findMany();
}

export async function findByUser(userId: string) {
  return db.query.userAchievements.findMany({
    where: eq(userAchievements.user_id, userId),
    with: { achievement: true },
  } as any);
}

export async function updateProgress(userId: string, achievementId: string, value: number) {
  const [ua] = await db
    .insert(userAchievements)
    .values({
      user_id: userId,
      achievement_id: achievementId,
      current_value: value,
    })
    .onConflictDoUpdate({
      target: [userAchievements.user_id, userAchievements.achievement_id],
      set: {
        current_value: sql`${userAchievements.current_value} + ${value}`,
        updated_at: new Date(),
      },
    })
    .returning();
  return ua;
}

export async function complete(userId: string, achievementId: string) {
  return db
    .update(userAchievements)
    .set({ completed_at: new Date(), updated_at: new Date() })
    .where(and(eq(userAchievements.user_id, userId), eq(userAchievements.achievement_id, achievementId)))
    .returning();
}
