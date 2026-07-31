#!/bin/bash

mkdir -p server/repositories

cat << 'FILE' > server/repositories/user.repository.ts
import { db } from "@virlio/database";
import { users } from "@virlio/database/schema";
import { eq, isNull, desc } from "drizzle-orm";
import type { User } from "@virlio/database/types";

/**
 * Find user by ID
 */
export async function findById(id: string) {
  const result = await db.query.users.findFirst({
    where: (u, { and, eq, isNull }) => and(eq(u.id, id), isNull(u.deletedAt)),
  });
  return result || null;
}

/**
 * Find user by email
 */
export async function findByEmail(email: string) {
  const result = await db.query.users.findFirst({
    where: (u, { and, eq, isNull }) => and(eq(u.email, email), isNull(u.deletedAt)),
  });
  return result || null;
}

/**
 * Find user by username
 */
export async function findByUsername(username: string) {
  const result = await db.query.users.findFirst({
    where: (u, { and, eq, isNull }) => and(eq(u.username, username), isNull(u.deletedAt)),
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
  const [user] = await db.update(users)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

/**
 * Soft delete user
 */
export async function softDelete(id: string) {
  const [user] = await db.update(users)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, id))
    .returning();
  return user || null;
}

/**
 * Find public profiles
 */
export async function findPublicProfiles(options: { limit?: number; offset?: number; sort?: string }) {
  const limit = options.limit || 10;
  const offset = options.offset || 0;
  return db.query.users.findMany({
    where: (u, { isNull }) => isNull(u.deletedAt),
    limit,
    offset,
    orderBy: desc(users.createdAt),
  });
}

/**
 * Update last seen timestamp
 */
export async function updateLastSeen(id: string) {
  await db.update(users)
    .set({ lastSeenAt: new Date() } as any)
    .where(eq(users.id, id));
}
FILE

cat << 'FILE' > server/repositories/brand.repository.ts
import { db } from "@virlio/database";
import { brands } from "@virlio/database/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import type { Brand } from "@virlio/database/types";

export async function findById(id: string) {
  return (await db.query.brands.findFirst({ where: and(eq(brands.id, id), isNull(brands.deletedAt)) })) || null;
}

export async function findBySlug(slug: string) {
  return (await db.query.brands.findFirst({ where: and(eq(brands.slug, slug), isNull(brands.deletedAt)) })) || null;
}

export async function findByOwner(ownerId: string) {
  return db.query.brands.findMany({ where: and(eq(brands.ownerId, ownerId), isNull(brands.deletedAt)) });
}

export async function create(data: Partial<Brand>) {
  const [brand] = await db.insert(brands).values(data as any).returning();
  return brand;
}

export async function update(id: string, data: Partial<Brand>) {
  const [brand] = await db.update(brands).set({ ...data, updatedAt: new Date() }).where(eq(brands.id, id)).returning();
  return brand || null;
}

export async function softDelete(id: string) {
  const [brand] = await db.update(brands).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(brands.id, id)).returning();
  return brand || null;
}

export async function findPublicBrands(options: { limit?: number; offset?: number }) {
  return db.query.brands.findMany({
    where: isNull(brands.deletedAt),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(brands.createdAt)
  });
}

export async function findVerifiedBrands(options: { limit?: number; offset?: number }) {
  return db.query.brands.findMany({
    where: and(isNull(brands.deletedAt), eq(brands.isVerified as any, true)),
    limit: options.limit || 10,
    offset: options.offset || 0
  });
}

export async function updateVerificationStatus(id: string, status: string, verifiedBy?: string) {
  return update(id, { verificationStatus: status, isVerified: status === "VERIFIED", verifiedById: verifiedBy } as any);
}
FILE

cat << 'FILE' > server/repositories/template.repository.ts
import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { eq, isNull, and, desc, or, ilike, sql } from "drizzle-orm";
import type { Template } from "@virlio/database/types";

export async function findById(id: string) {
  return (await db.query.templates.findFirst({ where: and(eq(templates.id, id), isNull(templates.deletedAt)) })) || null;
}

export async function findBySlug(slug: string) {
  return (await db.query.templates.findFirst({ where: and(eq(templates.slug, slug), isNull(templates.deletedAt)) })) || null;
}

export async function findByCategory(category: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(eq(templates.category as any, category), isNull(templates.deletedAt)),
    limit: options.limit || 10,
    offset: options.offset || 0
  });
}

export async function findByContributor(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(eq(templates.contributorId as any, userId), isNull(templates.deletedAt)),
    limit: options.limit || 10,
    offset: options.offset || 0
  });
}

export async function findPublicTemplates(options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(isNull(templates.deletedAt), eq(templates.isPublic as any, true)),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(templates.createdAt)
  });
}

export async function create(data: Partial<Template>) {
  const [template] = await db.insert(templates).values(data as any).returning();
  return template;
}

export async function update(id: string, data: Partial<Template>) {
  const [template] = await db.update(templates).set({ ...data, updatedAt: new Date() }).where(eq(templates.id, id)).returning();
  return template || null;
}

export async function softDelete(id: string) {
  const [template] = await db.update(templates).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(templates.id, id)).returning();
  return template || null;
}

export async function updateModerationStatus(id: string, status: string, metadata?: any) {
  return update(id, { moderationStatus: status as any, moderationMetadata: metadata } as any);
}

export async function incrementDownloads(id: string) {
  await db.update(templates).set({ downloads: sql`${templates.downloads as any} + 1` }).where(eq(templates.id, id));
}

export async function search(query: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(
      isNull(templates.deletedAt),
      or(ilike(templates.title, `%${query}%`), ilike(templates.category as any, `%${query}%`))
    ),
    limit: options.limit || 10,
    offset: options.offset || 0
  });
}
FILE

cat << 'FILE' > server/repositories/meme.repository.ts
import { db } from "@virlio/database";
import { memes } from "@virlio/database/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import type { Meme } from "@virlio/database/types";

export async function findById(id: string) {
  return (await db.query.memes.findFirst({ where: and(eq(memes.id, id), isNull(memes.deletedAt)) })) || null;
}

export async function findByBrand(brandId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(eq(memes.brandId as any, brandId), isNull(memes.deletedAt)),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.createdAt)
  });
}

export async function findByTemplate(templateId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(eq(memes.templateId as any, templateId), isNull(memes.deletedAt)),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.createdAt)
  });
}

export async function findPublicMemes(options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(isNull(memes.deletedAt), eq(memes.isPublic as any, true)),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.createdAt)
  });
}

export async function findByGenerator(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(eq(memes.generatorId as any, userId), isNull(memes.deletedAt)),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.createdAt)
  });
}

export async function create(data: Partial<Meme>) {
  const [meme] = await db.insert(memes).values(data as any).returning();
  return meme;
}

export async function update(id: string, data: Partial<Meme>) {
  const [meme] = await db.update(memes).set({ ...data, updatedAt: new Date() }).where(eq(memes.id, id)).returning();
  return meme || null;
}

export async function softDelete(id: string) {
  const [meme] = await db.update(memes).set({ deletedAt: new Date(), updatedAt: new Date() }).where(eq(memes.id, id)).returning();
  return meme || null;
}
FILE

cat << 'FILE' > server/repositories/vote.repository.ts
import { db } from "@virlio/database";
import { votes } from "@virlio/database/schema";
import { eq, and, sql } from "drizzle-orm";

export async function upsertVote(entityType: string, entityId: string, userId: string, voteType: 'UP' | 'DOWN') {
  const [vote] = await db.insert(votes).values({
    entityType: entityType as any,
    entityId,
    userId,
    voteType: voteType as any,
  } as any)
  .onConflictDoUpdate({
    target: [votes.userId, votes.entityType, votes.entityId] as any,
    set: { voteType: voteType as any, updatedAt: new Date() }
  })
  .returning();
  return vote;
}

export async function removeVote(entityType: string, entityId: string, userId: string) {
  await db.delete(votes).where(and(eq(votes.entityType as any, entityType), eq(votes.entityId, entityId), eq(votes.userId, userId)));
}

export async function getVoteCounts(entityType: string, entityId: string) {
  const result = await db.select({
    voteType: votes.voteType as any,
    count: sql<number>\`count(*)::int\`
  }).from(votes).where(and(eq(votes.entityType as any, entityType), eq(votes.entityId, entityId))).groupBy(votes.voteType as any);
  
  let upvotes = 0;
  let downvotes = 0;
  for (const r of result) {
    if (r.voteType === 'UP') upvotes = r.count;
    if (r.voteType === 'DOWN') downvotes = r.count;
  }
  return { upvotes, downvotes };
}

export async function getUserVote(entityType: string, entityId: string, userId: string) {
  return (await db.query.votes.findFirst({
    where: and(eq(votes.entityType as any, entityType), eq(votes.entityId, entityId), eq(votes.userId, userId))
  })) || null;
}
FILE

cat << 'FILE' > server/repositories/follow.repository.ts
import { db } from "@virlio/database";
import { follows } from "@virlio/database/schema";
import { eq, and, sql } from "drizzle-orm";

export async function follow(followerId: string, followingId: string, followingType: 'USER' | 'BRAND') {
  const [f] = await db.insert(follows).values({
    followerId,
    followingId,
    followingType: followingType as any
  } as any)
  .onConflictDoNothing()
  .returning();
  return f;
}

export async function unfollow(followerId: string, followingId: string, followingType: 'USER' | 'BRAND') {
  await db.delete(follows).where(and(
    eq(follows.followerId, followerId),
    eq(follows.followingId, followingId),
    eq(follows.followingType as any, followingType)
  ));
}

export async function getFollowers(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.follows.findMany({
    where: and(eq(follows.followingId, userId), eq(follows.followingType as any, 'USER')),
    limit: options.limit || 10,
    offset: options.offset || 0,
    with: { follower: true }
  } as any);
}

export async function getFollowing(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.follows.findMany({
    where: eq(follows.followerId, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}

export async function isFollowing(followerId: string, followingId: string, followingType: 'USER' | 'BRAND') {
  const f = await db.query.follows.findFirst({
    where: and(
      eq(follows.followerId, followerId),
      eq(follows.followingId, followingId),
      eq(follows.followingType as any, followingType)
    )
  });
  return !!f;
}

export async function getFollowerCount(userId: string) {
  const res = await db.select({ count: sql<number>\`count(*)::int\` }).from(follows).where(and(eq(follows.followingId, userId), eq(follows.followingType as any, 'USER')));
  return res[0]?.count || 0;
}

export async function getFollowingCount(userId: string) {
  const res = await db.select({ count: sql<number>\`count(*)::int\` }).from(follows).where(eq(follows.followerId, userId));
  return res[0]?.count || 0;
}
FILE

cat << 'FILE' > server/repositories/report.repository.ts
import { db } from "@virlio/database";
import { reports } from "@virlio/database/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export async function create(data: any) {
  const [report] = await db.insert(reports).values(data).returning();
  return report;
}

export async function findPending(options: { limit?: number; offset?: number } = {}) {
  return db.query.reports.findMany({
    where: eq(reports.status as any, 'PENDING'),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(reports.createdAt)
  });
}

export async function findByEntity(entityType: string, entityId: string) {
  return db.query.reports.findMany({
    where: and(eq(reports.entityType as any, entityType), eq(reports.entityId, entityId))
  });
}

export async function resolve(id: string, moderatorId: string, notes?: string) {
  const [r] = await db.update(reports).set({
    status: 'RESOLVED' as any,
    resolvedById: moderatorId,
    resolvedAt: new Date(),
    resolutionNotes: notes,
    updatedAt: new Date()
  } as any).where(eq(reports.id, id)).returning();
  return r;
}

export async function dismiss(id: string, moderatorId: string, notes?: string) {
  const [r] = await db.update(reports).set({
    status: 'DISMISSED' as any,
    resolvedById: moderatorId,
    resolvedAt: new Date(),
    resolutionNotes: notes,
    updatedAt: new Date()
  } as any).where(eq(reports.id, id)).returning();
  return r;
}
FILE

cat << 'FILE' > server/repositories/badge.repository.ts
import { db } from "@virlio/database";
import { badges, userBadges, brandBadges } from "@virlio/database/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function findAll() {
  return db.query.badges.findMany({ where: isNull(badges.deletedAt) });
}

export async function findBySlug(slug: string) {
  return (await db.query.badges.findFirst({ where: and(eq(badges.slug, slug), isNull(badges.deletedAt)) })) || null;
}

export async function findByUser(userId: string) {
  return db.query.userBadges.findMany({
    where: eq(userBadges.userId, userId),
    with: { badge: true }
  } as any);
}

export async function findByBrand(brandId: string) {
  return db.query.brandBadges.findMany({
    where: eq(brandBadges.brandId as any, brandId),
    with: { badge: true }
  } as any);
}

export async function awardToUser(userId: string, badgeId: string) {
  const [ub] = await db.insert(userBadges).values({ userId, badgeId } as any).onConflictDoNothing().returning();
  return ub;
}

export async function awardToBrand(brandId: string, badgeId: string) {
  const [bb] = await db.insert(brandBadges).values({ brandId, badgeId } as any).onConflictDoNothing().returning();
  return bb;
}
FILE

cat << 'FILE' > server/repositories/achievement.repository.ts
import { db } from "@virlio/database";
import { achievements, userAchievements } from "@virlio/database/schema";
import { eq, and, isNull, sql } from "drizzle-orm";

export async function findAll() {
  return db.query.achievements.findMany({ where: isNull(achievements.deletedAt) });
}

export async function findByUser(userId: string) {
  return db.query.userAchievements.findMany({
    where: eq(userAchievements.userId, userId),
    with: { achievement: true }
  } as any);
}

export async function updateProgress(userId: string, achievementId: string, value: number) {
  const [ua] = await db.insert(userAchievements).values({
    userId,
    achievementId,
    progress: value
  } as any)
  .onConflictDoUpdate({
    target: [userAchievements.userId, userAchievements.achievementId] as any,
    set: { progress: sql`${userAchievements.progress as any} + ${value}`, updatedAt: new Date() } as any
  }).returning();
  return ua;
}

export async function complete(userId: string, achievementId: string) {
  return db.update(userAchievements).set({ isCompleted: true as any, completedAt: new Date(), updatedAt: new Date() } as any)
    .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId))).returning();
}
FILE

cat << 'FILE' > server/repositories/streak.repository.ts
import { db } from "@virlio/database";
import { streaks } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

export async function findByUser(userId: string) {
  return db.query.streaks.findMany({ where: eq(streaks.userId, userId) });
}

export async function findByUserAndCategory(userId: string, category: string) {
  return (await db.query.streaks.findFirst({ where: and(eq(streaks.userId, userId), eq(streaks.category as any, category)) })) || null;
}

export async function incrementStreak(userId: string, category: string) {
  const existing = await findByUserAndCategory(userId, category);
  if (existing) {
    const [s] = await db.update(streaks).set({ currentStreak: existing.currentStreak! + 1, lastActiveAt: new Date(), updatedAt: new Date() } as any)
      .where(eq(streaks.id, existing.id)).returning();
    return s;
  } else {
    const [s] = await db.insert(streaks).values({ userId, category: category as any, currentStreak: 1, lastActiveAt: new Date() } as any).returning();
    return s;
  }
}

export async function resetStreak(userId: string, category: string) {
  const [s] = await db.update(streaks).set({ currentStreak: 0, updatedAt: new Date() } as any)
    .where(and(eq(streaks.userId, userId), eq(streaks.category as any, category))).returning();
  return s;
}

export async function freezeStreak(userId: string, category: string, until: Date) {
  const [s] = await db.update(streaks).set({ frozenUntil: until, updatedAt: new Date() } as any)
    .where(and(eq(streaks.userId, userId), eq(streaks.category as any, category))).returning();
  return s;
}
FILE

cat << 'FILE' > server/repositories/xp.repository.ts
import { db } from "@virlio/database";
import { xpEvents, userLevels } from "@virlio/database/schema";
import { eq, desc } from "drizzle-orm";

export async function addXP(userId: string, amount: number, reason: string, sourceType?: string, sourceId?: string) {
  const [event] = await db.insert(xpEvents).values({
    userId,
    amount,
    reason,
    sourceType,
    sourceId
  } as any).returning();
  return event;
}

export async function getUserLevel(userId: string) {
  return (await db.query.userLevels.findFirst({ where: eq(userLevels.userId, userId) })) || null;
}

export async function getXPHistory(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.xpEvents.findMany({
    where: eq(xpEvents.userId, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(xpEvents.createdAt)
  });
}

export async function updateLevel(userId: string, level: number, currentXp: number, lifetimeXp: number, nextLevelXp: number) {
  const [ul] = await db.insert(userLevels).values({
    userId,
    level,
    currentXp,
    lifetimeXp,
    nextLevelXp
  } as any)
  .onConflictDoUpdate({
    target: userLevels.userId as any,
    set: { level, currentXp, lifetimeXp, nextLevelXp, updatedAt: new Date() }
  }).returning();
  return ul;
}
FILE

cat << 'FILE' > server/repositories/activity.repository.ts
import { db } from "@virlio/database";
import { activities } from "@virlio/database/schema";
import { eq, desc } from "drizzle-orm";

export async function create(data: any) {
  const [activity] = await db.insert(activities).values(data).returning();
  return activity;
}

export async function findByUser(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.activities.findMany({
    where: eq(activities.userId, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(activities.createdAt)
  });
}

export async function findPublic(options: { limit?: number; offset?: number } = {}) {
  return db.query.activities.findMany({
    where: eq(activities.isPublic as any, true),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(activities.createdAt)
  });
}

export async function findRecent(limit: number = 10) {
  return findPublic({ limit });
}
FILE

cat << 'FILE' > server/repositories/notification.repository.ts
import { db } from "@virlio/database";
import { notifications } from "@virlio/database/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function create(data: any) {
  const [notification] = await db.insert(notifications).values(data).returning();
  return notification;
}

export async function findByUser(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(notifications.createdAt)
  });
}

export async function markRead(id: string) {
  const [n] = await db.update(notifications).set({ isRead: true as any, readAt: new Date(), updatedAt: new Date() } as any).where(eq(notifications.id, id)).returning();
  return n;
}

export async function markAllRead(userId: string) {
  await db.update(notifications).set({ isRead: true as any, readAt: new Date(), updatedAt: new Date() } as any).where(eq(notifications.userId, userId));
}

export async function countUnread(userId: string) {
  const res = await db.select({ count: sql<number>\`count(*)::int\` }).from(notifications).where(and(eq(notifications.userId, userId), eq(notifications.isRead as any, false)));
  return res[0]?.count || 0;
}
FILE

cat << 'FILE' > server/repositories/stats.repository.ts
import { db } from "@virlio/database";
import { userStats, brandStats } from "@virlio/database/schema";
import { eq, sql } from "drizzle-orm";

export async function getUserStats(userId: string) {
  return (await db.query.userStats.findFirst({ where: eq(userStats.userId, userId) })) || null;
}

export async function getBrandStats(brandId: string) {
  return (await db.query.brandStats.findFirst({ where: eq(brandStats.brandId as any, brandId) })) || null;
}

export async function upsertUserStats(userId: string, data: any) {
  const [us] = await db.insert(userStats).values({ userId, ...data } as any)
    .onConflictDoUpdate({ target: userStats.userId as any, set: { ...data, updatedAt: new Date() } }).returning();
  return us;
}

export async function upsertBrandStats(brandId: string, data: any) {
  const [bs] = await db.insert(brandStats).values({ brandId, ...data } as any)
    .onConflictDoUpdate({ target: brandStats.brandId as any, set: { ...data, updatedAt: new Date() } }).returning();
  return bs;
}

export async function incrementUserStat(userId: string, field: string, amount: number = 1) {
  await db.update(userStats).set({ [field]: sql\`${userStats[field as keyof typeof userStats] as any} + ${amount}\`, updatedAt: new Date() } as any).where(eq(userStats.userId, userId));
}

export async function incrementBrandStat(brandId: string, field: string, amount: number = 1) {
  await db.update(brandStats).set({ [field]: sql\`${brandStats[field as keyof typeof brandStats] as any} + ${amount}\`, updatedAt: new Date() } as any).where(eq(brandStats.brandId as any, brandId));
}
FILE

cat << 'FILE' > server/repositories/cloud-asset.repository.ts
import { db } from "@virlio/database";
import { cloudAssets } from "@virlio/database/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function create(data: any) {
  const [asset] = await db.insert(cloudAssets).values(data).returning();
  return asset;
}

export async function findByEntity(entityType: string, entityId: string) {
  return db.query.cloudAssets.findMany({
    where: and(eq(cloudAssets.entityType as any, entityType), eq(cloudAssets.entityId as any, entityId), isNull(cloudAssets.deletedAt))
  });
}

export async function findByPublicId(publicId: string) {
  return (await db.query.cloudAssets.findFirst({
    where: and(eq(cloudAssets.publicId, publicId), isNull(cloudAssets.deletedAt))
  })) || null;
}

export async function softDelete(id: string) {
  const [asset] = await db.update(cloudAssets).set({ deletedAt: new Date(), updatedAt: new Date() } as any).where(eq(cloudAssets.id, id)).returning();
  return asset || null;
}
FILE

cat << 'FILE' > server/repositories/index.ts
export * as userRepository from "./user.repository";
export * as brandRepository from "./brand.repository";
export * as templateRepository from "./template.repository";
export * as memeRepository from "./meme.repository";
export * as voteRepository from "./vote.repository";
export * as followRepository from "./follow.repository";
export * as reportRepository from "./report.repository";
export * as badgeRepository from "./badge.repository";
export * as achievementRepository from "./achievement.repository";
export * as streakRepository from "./streak.repository";
export * as xpRepository from "./xp.repository";
export * as activityRepository from "./activity.repository";
export * as notificationRepository from "./notification.repository";
export * as statsRepository from "./stats.repository";
export * as cloudAssetRepository from "./cloud-asset.repository";
FILE
