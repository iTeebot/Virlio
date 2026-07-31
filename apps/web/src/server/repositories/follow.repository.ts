import { db } from "@virlio/database";
import { follows } from "@virlio/database/schema";
import { eq, and, count } from "drizzle-orm";

export async function follow(followerId: string, followingId: string, followingType: "user" | "brand") {
  const [f] = await db
    .insert(follows)
    .values({
      follower_id: followerId,
      following_id: followingId,
      following_type: followingType as any,
    })
    .onConflictDoNothing()
    .returning();
  return f;
}

export async function unfollow(followerId: string, followingId: string, followingType: "user" | "brand") {
  await db
    .delete(follows)
    .where(
      and(
        eq(follows.follower_id, followerId),
        eq(follows.following_id, followingId),
        eq(follows.following_type as any, followingType)
      )
    );
}

export async function getFollowers(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.follows.findMany({
    where: and(eq(follows.following_id, userId), eq(follows.following_type as any, "user")),
    limit: options.limit || 10,
    offset: options.offset || 0,
    with: { follower: true },
  } as any);
}

export async function getFollowing(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.follows.findMany({
    where: eq(follows.follower_id, userId),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}

export async function isFollowing(followerId: string, followingId: string, followingType: "user" | "brand") {
  const f = await db.query.follows.findFirst({
    where: and(
      eq(follows.follower_id, followerId),
      eq(follows.following_id, followingId),
      eq(follows.following_type as any, followingType)
    ),
  });
  return !!f;
}

export async function getFollowerCount(userId: string) {
  const res = await db
    .select({ count: count() })
    .from(follows)
    .where(and(eq(follows.following_id, userId), eq(follows.following_type as any, "user")));
  return res[0]?.count || 0;
}

export async function getFollowingCount(userId: string) {
  const res = await db.select({ count: count() }).from(follows).where(eq(follows.follower_id, userId));
  return res[0]?.count || 0;
}
