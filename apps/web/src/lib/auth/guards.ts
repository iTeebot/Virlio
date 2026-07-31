import { auth } from "./config";
import { redirect } from "next/navigation";
import { hasMinimumRole, isAdmin, canModerate, canEditBrand } from "./permissions";

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(minRole: "user" | "creator" | "brand" | "moderator" | "admin") {
  const session = await requireAuth();
  if (!hasMinimumRole(session.user.role, minRole)) {
    redirect("/access-restricted");
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!isAdmin(session.user.role)) {
    redirect("/access-restricted");
  }
  return session;
}

export async function requireModerator() {
  const session = await requireAuth();
  if (!canModerate(session.user.role)) {
    redirect("/access-restricted");
  }
  return session;
}

export async function requireBrandOwner(brandId: string) {
  const session = await requireAuth();
  const isOwner = await canEditBrand(session.user.id, brandId);
  if (!isOwner && !isAdmin(session.user.role)) {
    redirect("/access-restricted");
  }
  return session;
}
