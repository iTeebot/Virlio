import { db } from "@virlio/database";
import { eq, and, isNull } from "drizzle-orm";
// Assuming there is a brand_members or similar table, placeholder logic below
// If using specific schema, replace with actual queries.
// import { brands } from "@virlio/database/schema";

export const ROLE_HIERARCHY: Record<string, number> = {
  user: 10,
  creator: 20,
  brand: 30,
  moderator: 40,
  admin: 50,
};

export function hasMinimumRole(userRole: string = "user", requiredRole: string): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}

export function isAdmin(userRole: string = "user"): boolean {
  return hasMinimumRole(userRole, "admin");
}

export function canModerate(userRole: string = "user"): boolean {
  return hasMinimumRole(userRole, "moderator");
}

export async function canEditBrand(userId: string, brandId: string): Promise<boolean> {
  // Placeholder: Implement actual DB check using user_id and brand_id
  // e.g., const member = await db.query.brandMembers.findFirst({ where: (members, { eq, and }) => and(eq(members.brandId, brandId), eq(members.userId, userId)) });
  // return !!member;
  return false;
}
