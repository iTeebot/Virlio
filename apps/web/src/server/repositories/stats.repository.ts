import { db } from "@virlio/database";
import { userStats, brandStats } from "@virlio/database/schema";
import { eq, sql } from "drizzle-orm";

export async function getUserStats(userId: string) {
  return (await db.query.userStats.findFirst({ where: eq(userStats.user_id, userId) })) || null;
}

export async function getBrandStats(brandId: string) {
  return (await db.query.brandStats.findFirst({ where: eq(brandStats.brand_id, brandId) })) || null;
}

export async function upsertUserStats(userId: string, data: any) {
  const [us] = await db
    .insert(userStats)
    .values({ user_id: userId, ...data } as any)
    .onConflictDoUpdate({ target: userStats.user_id, set: { ...data, updated_at: new Date() } })
    .returning();
  return us;
}

export async function upsertBrandStats(brandId: string, data: any) {
  const [bs] = await db
    .insert(brandStats)
    .values({ brand_id: brandId, ...data } as any)
    .onConflictDoUpdate({ target: brandStats.brand_id, set: { ...data, updated_at: new Date() } })
    .returning();
  return bs;
}

export async function incrementUserStat(userId: string, field: string, amount: number = 1) {
  await db
    .update(userStats)
    .set({
      [field]: sql`${userStats[field as keyof typeof userStats]} + ${amount}`,
      updated_at: new Date(),
    } as any)
    .where(eq(userStats.user_id, userId));
}

export async function incrementBrandStat(brandId: string, field: string, amount: number = 1) {
  await db
    .update(brandStats)
    .set({
      [field]: sql`${brandStats[field as keyof typeof brandStats]} + ${amount}`,
      updated_at: new Date(),
    } as any)
    .where(eq(brandStats.brand_id, brandId));
}
