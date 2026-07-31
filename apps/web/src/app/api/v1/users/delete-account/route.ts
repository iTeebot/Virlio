import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/config";
import { db } from "@virlio/database";
import { users, accounts, sessions } from "@virlio/database/schema";
import { eq } from "drizzle-orm";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return apiUnauthorized("Authentication required to delete account.");
  }

  const userId = session.user.id;

  // 1. Delete OAuth accounts linked to user
  await db.delete(accounts).where(eq(accounts.userId, userId));

  // 2. Delete user sessions
  await db.delete(sessions).where(eq(sessions.userId, userId));

  // 3. Delete user record
  await db.delete(users).where(eq(users.id, userId));

  return apiSuccess({
    deleted: true,
    message: "Account and associated user data permanently deleted.",
  });
});
