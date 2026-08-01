import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";
import { emailOTPService } from "@/lib/services/email-otp.service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ message: "A valid email address is required." }, { status: 400 });
    }

    const result = emailOTPService.generateOTP(email);

    if (result.error) {
      return NextResponse.json({ message: result.error, cooldownSeconds: result.cooldownSeconds }, { status: 429 });
    }

    // Send real email via Resend API
    await emailOTPService.sendResendEmail(email.trim(), result.otp);

    return NextResponse.json({
      message: `Verification code sent to ${email.trim()}. Please check your email inbox.`,
      cooldownSeconds: result.cooldownSeconds,
    });
  } catch (error: any) {
    console.error("Email OTP Send Error:", error);
    return NextResponse.json({ message: error.message || "Failed to send email verification code via Resend" }, { status: 500 });
  }
}
