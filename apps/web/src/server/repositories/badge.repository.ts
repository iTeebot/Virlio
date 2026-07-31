import { db } from "@virlio/database";
import { badges, userBadges, brandBadges } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

export async function findAll() {
  return db.query.badges.findMany();
}

export async function findBySlug(slug: string) {
  return (await db.query.badges.findFirst({ where: eq(badges.slug, slug) })) || null;
}

export async function findByUser(userId: string) {
  return db.query.userBadges.findMany({
    where: eq(userBadges.user_id, userId),
    with: { badge: true },
  } as any);
}

export async function findByBrand(brandId: string) {
  return db.query.brandBadges.findMany({
    where: eq(brandBadges.brand_id, brandId),
    with: { badge: true },
  } as any);
}

export async function awardToUser(userId: string, badgeId: string) {
  const [ub] = await db
    .insert(userBadges)
    .values({ user_id: userId, badge_id: badgeId, unlocked_at: new Date() })
    .onConflictDoNothing()
    .returning();
  return ub;
}

export async function awardToBrand(brandId: string, badgeId: string) {
  const [bb] = await db
    .insert(brandBadges)
    .values({ brand_id: brandId, badge_id: badgeId, unlocked_at: new Date() })
    .onConflictDoNothing()
    .returning();
  return bb;
}

export async function awardBadgeBySlug(userId: string, badgeSlug: string) {
  let badge = await findBySlug(badgeSlug);
  if (!badge && badgeSlug === "early-adopter") {
    const [newB] = await db
      .insert(badges)
      .values({
        name: "Early Adopter",
        slug: "early-adopter",
        description: "Joined Virlio during the early launch phase before October 2026",
        category: "special",
        icon_url: "/images/badges/badge_Early_adopter.png",
      })
      .onConflictDoNothing()
      .returning();
    badge = newB || (await findBySlug(badgeSlug));
  }

  if (badge) {
    return awardToUser(userId, badge.id);
  }
  return null;
}

