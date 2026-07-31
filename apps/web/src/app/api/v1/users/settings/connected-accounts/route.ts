import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { accountRepository, userRepository } from "@/server/repositories";
import { calculateProfileScore } from "@/lib/services/profile-score.service";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

/**
 * GET /api/v1/users/settings/connected-accounts
 * List all connected OAuth accounts for current user
 */
export async function GET() {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const userAccounts = await accountRepository.findByUserId(session.user.id);
    const scoreData = await calculateProfileScore(session.user.id);

    // Redact sensitive tokens completely
    const sanitizedAccounts = userAccounts.map((acc) => ({
      provider: acc.provider,
      providerAccountId: acc.providerAccountId,
      type: acc.type,
    }));

    return apiSuccess({
      accounts: sanitizedAccounts,
      profileScore: scoreData,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch connected accounts", 500);
  }
}

/**
 * DELETE /api/v1/users/settings/connected-accounts?provider=github
 * Unlink a connected OAuth account with safety checks preventing lockout
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get("provider")?.toLowerCase().trim();

    if (!provider) {
      return apiError("Missing 'provider' parameter", 400);
    }

    const userId = session.user.id;
    const userAccounts = await accountRepository.findByUserId(userId);

    // 1. Check if provider is actually connected
    const targetAccount = userAccounts.find((a) => a.provider.toLowerCase() === provider);
    if (!targetAccount) {
      return apiError(`Provider '${provider}' is not connected to your account.`, 404);
    }

    // 2. Prevent account lockout (Safety Rule #22)
    if (userAccounts.length <= 1) {
      return apiError(
        "You cannot disconnect your only remaining sign-in method. Connect another account before disconnecting this one.",
        400
      );
    }

    // 3. Delete linked account
    await accountRepository.deleteAccount(userId, targetAccount.provider);

    // 4. Recalculate profile score idempotently
    const updatedScore = await calculateProfileScore(userId);

    return apiSuccess({
      disconnected: true,
      provider,
      profileScore: updatedScore,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to disconnect account", 500);
  }
}
