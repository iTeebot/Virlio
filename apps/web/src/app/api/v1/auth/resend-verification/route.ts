import { NextRequest } from "next/server";
import { userRepository } from "@/server/repositories";
import { emailVerificationService } from "@/server/services/email-verification.service";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const body = await req.json().catch(() => null);
  const email = (body?.email || "").trim().toLowerCase();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return apiError("Please provide a valid email address.", 400);
  }

  const user = await userRepository.findByEmail(email);

  if (!user) {
    // Return standard message to prevent email enumeration
    return apiSuccess({ resent: true, message: "If an account exists for this email, a verification link has been sent." });
  }

  if (user.emailVerified) {
    return apiError("This email address is already verified. Please sign in.", 400);
  }

  // Rate Limiting Cooldown Check (60 seconds)
  const rateCheck = emailVerificationService.checkRateLimit(email);
  if (!rateCheck.allowed) {
    return apiError(`Please wait ${rateCheck.remainingSeconds} seconds before requesting another verification email.`, 429);
  }

  try {
    const { token } = await emailVerificationService.generateVerificationToken(email);
    await emailVerificationService.sendVerificationEmail(email, user.name || "Creator", token);

    return apiSuccess({
      resent: true,
      message: "Verification email resent successfully. Please check your inbox.",
    });
  } catch (err: any) {
    console.error("[ResendVerification] Error resending verification email:", err);
    return apiError("We couldn't send your verification email. Please try again.", 500);
  }
});
