import { auth } from "@/lib/auth";
import { cache } from "react";

/**
 * Request-scoped memoized session resolver.
 * Deduplicates NextAuth auth() calls within a single HTTP request lifecycle.
 */
export const getCurrentSession = cache(async () => {
  return await auth();
});

/**
 * Request-scoped memoized user resolver.
 * Deduplicates user lookups within a single HTTP request lifecycle.
 */
export const getCurrentUser = cache(async () => {
  const session = await getCurrentSession();
  if (!session?.user?.id) return null;
  return session.user;
});

/**
 * Require authentication guard reusing memoized session.
 */
export async function requireAuthentication() {
  const session = await getCurrentSession();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}
