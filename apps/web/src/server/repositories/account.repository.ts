import { db } from "@virlio/database";
import { accounts } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

/**
 * Find all connected accounts for a given user ID
 */
export async function findByUserId(userId: string) {
  return db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });
}

/**
 * Find a specific account row by provider and providerAccountId
 */
export async function findByProviderAndAccountId(provider: string, providerAccountId: string) {
  return (
    (await db.query.accounts.findFirst({
      where: and(eq(accounts.provider, provider), eq(accounts.providerAccountId, providerAccountId)),
    })) || null
  );
}

/**
 * Find account row by user ID and provider
 */
export async function findByUserIdAndProvider(userId: string, provider: string) {
  return (
    (await db.query.accounts.findFirst({
      where: and(eq(accounts.userId, userId), eq(accounts.provider, provider)),
    })) || null
  );
}

/**
 * Unlink / delete a connected account for a user
 */
export async function deleteAccount(userId: string, provider: string) {
  return db
    .delete(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, provider)))
    .returning();
}
