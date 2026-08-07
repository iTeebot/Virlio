import { db } from "@virlio/database";
import { badges, userBadges, brandBadges } from "@virlio/database/schema";
import { eq, and, notInArray } from "drizzle-orm";
import { OFFICIAL_SYSTEM_BADGES, ALLOWED_BADGE_SLUGS } from "@/server/constants/badge-catalog";

export async function findAll() {
  return db.query.badges.findMany();
}

export async function findBySlug(slug: string) {
  return (await db.query.badges.findFirst({ where: eq(badges.slug, slug) })) || null;
}

export async function findByUser(userId: string) {
  const userBadgesList = await db.query.userBadges.findMany({
    where: eq(userBadges.user_id, userId),
    with: { badge: true },
  } as any);

  // Filter out any non-system badges that do not exist in OFFICIAL_SYSTEM_BADGES
  return (userBadgesList || [])
    .filter((ub: any) => {
      const slug = ub.badge?.slug || ub.badge_id;
      return slug && ALLOWED_BADGE_SLUGS.has(slug);
    })
    .map((ub: any) => {
      const slug = ub.badge?.slug || ub.badge_id;
      const def = OFFICIAL_SYSTEM_BADGES[slug];
      if (def) {
        return {
          ...ub,
          badge: {
            ...ub.badge,
            id: ub.badge?.id || slug,
            slug,
            name: def.name,
            category: def.category,
            description: def.description,
            icon_url: def.icon_url,
          },
        };
      }
      return ub;
    });
}

export async function findByBrand(brandId: string) {
  return db.query.brandBadges.findMany({
    where: eq(brandBadges.brand_id, brandId),
    with: { badge: true },
  } as any);
}

export async function awardToUser(userId: string, badgeId: string, customUnlockedAt?: Date) {
  const unlockDate = customUnlockedAt || new Date();
  const [ub] = await db
    .insert(userBadges)
    .values({ user_id: userId, badge_id: badgeId, unlocked_at: unlockDate })
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

/**
 * Server-Side Protected Badge Awarding
 * Only permits awarding official 13 system badges defined in OFFICIAL_SYSTEM_BADGES.
 */
export async function awardBadgeBySlug(userId: string, badgeSlug: string, customUnlockedAt?: Date) {
  if (!ALLOWED_BADGE_SLUGS.has(badgeSlug)) {
    console.warn(`[BadgeRepository] Attempted to award unauthorized badge slug: "${badgeSlug}". Rejected.`);
    return null;
  }

  const def = OFFICIAL_SYSTEM_BADGES[badgeSlug];
  let badge = await findBySlug(badgeSlug);

  if (!badge) {
    const [newB] = await db
      .insert(badges)
      .values({
        name: def.name,
        slug: def.slug,
        description: def.description,
        category: def.category.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_") as any,
        icon_url: def.icon_url,
      })
      .onConflictDoUpdate({
        target: badges.slug,
        set: {
          name: def.name,
          description: def.description,
          icon_url: def.icon_url,
          updated_at: new Date(),
        },
      })
      .returning();
    badge = newB || (await findBySlug(badgeSlug));
  } else if (!badge.icon_url || badge.icon_url !== def.icon_url || badge.name !== def.name) {
    // Self-healing update for existing badge rows with outdated icons
    await db
      .update(badges)
      .set({
        name: def.name,
        description: def.description,
        icon_url: def.icon_url,
        updated_at: new Date(),
      })
      .where(eq(badges.id, badge.id))
      .catch(() => null);
  }

  if (badge) {
    return awardToUser(userId, badge.id, customUnlockedAt);
  }
  return null;
}

export async function hasBadge(userId: string, badgeSlug: string): Promise<boolean> {
  if (!ALLOWED_BADGE_SLUGS.has(badgeSlug)) return false;
  const badge = await findBySlug(badgeSlug);
  if (!badge) return false;

  const existing = await db.query.userBadges.findFirst({
    where: and(eq(userBadges.user_id, userId), eq(userBadges.badge_id, badge.id)),
  });
  return Boolean(existing);
}

/**
 * Syncs official badge metadata and purges legacy/custom invalid badges from DB
 */
export async function syncOfficialBadgesAndPurgeLegacy() {
  try {
    // 1. Upsert all 13 official system badges
    for (const def of Object.values(OFFICIAL_SYSTEM_BADGES)) {
      await db
        .insert(badges)
        .values({
          name: def.name,
          slug: def.slug,
          description: def.description,
          category: def.category.toLowerCase().replace(/ & /g, "_").replace(/ /g, "_") as any,
          icon_url: def.icon_url,
        })
        .onConflictDoUpdate({
          target: badges.slug,
          set: {
            name: def.name,
            description: def.description,
            icon_url: def.icon_url,
            updated_at: new Date(),
          },
        })
        .catch(() => null);
    }

    // 2. Delete non-system badge rows from badges table
    const officialSlugs = Array.from(ALLOWED_BADGE_SLUGS);
    const legacyBadges = await db.query.badges.findMany({
      where: notInArray(badges.slug, officialSlugs),
    });

    if (legacyBadges.length > 0) {
      const legacyIds = legacyBadges.map((b) => b.id);
      for (const legacyId of legacyIds) {
        await db.delete(userBadges).where(eq(userBadges.badge_id, legacyId)).catch(() => null);
        await db.delete(brandBadges).where(eq(brandBadges.badge_id, legacyId)).catch(() => null);
        await db.delete(badges).where(eq(badges.id, legacyId)).catch(() => null);
      }
      console.log(`[BadgeRepository] Purged ${legacyBadges.length} non-system legacy badges from database.`);
    }
  } catch (err) {
    console.error("[BadgeRepository] Sync and purge error:", err);
  }
}
