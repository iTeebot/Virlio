import { NextRequest } from "next/server";
import { auth } from "@/lib/auth/config";
import { userLifecycleService } from "@/server/services/user-lifecycle.service";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const DELETE = withErrorHandling(async (req: NextRequest) => {
  const session = await auth();

  if (!session?.user?.id) {
    return apiUnauthorized("Authentication required to delete account.");
  }

  const userId = session.user.id;
  let reason = "User requested account deletion";

  try {
    const body = await req.json().catch(() => ({}));
    if (body.reason) reason = body.reason;
  } catch (e) {}

  const result = await userLifecycleService.deleteUserAccount(userId, reason);

  return apiSuccess({
    deleted: true,
    ...result,
  });
});
