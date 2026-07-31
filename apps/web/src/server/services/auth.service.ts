import { auth } from "@/lib/auth";

export async function getCurrentSession() {
  return await auth();
}

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  // This could fetch full user info including stats if needed, or simply return session user
  return session.user;
}

export async function requireAuthentication() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session;
}
