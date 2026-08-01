import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";
import { emailOTPService } from "@/lib/services/email-otp.service";
import { userRepository } from "@/server/repositories";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json({ message: "Email and verification code are required." }, { status: 400 });
    }

    const result = emailOTPService.verifyOTP(email, code);

    if (!result.verified) {
      return NextResponse.json({ message: result.error || "Verification failed." }, { status: 400 });
    }

    // If user verified their primary email address, update user record in database
    if (user.email && user.email.toLowerCase() === email.trim().toLowerCase()) {
      await userRepository.update(user.id, { emailVerified: new Date() } as any).catch(() => null);
      const { activityEngine } = await import("@/server/services/activity-engine.service");
      await activityEngine.recordActivity(user.id, "email_verified", "user", user.id, { email }).catch(() => null);
    }

    return NextResponse.json({
      data: { verified: true, email: email.trim() },
      message: "Email address verified successfully!",
    });
  } catch (error: any) {
    console.error("Email OTP Verify Error:", error);
    return NextResponse.json({ message: error.message || "Failed to verify email code" }, { status: 500 });
  }
}
