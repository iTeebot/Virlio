import { NextRequest, NextResponse } from "next/server";
import { emailVerificationService } from "@/server/services/email-verification.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.redirect(new URL("/login?error=VerificationFailed", req.url));
  }

  const result = await emailVerificationService.verifyToken(token);

  if (result.success) {
    const emailParam = result.email ? `&email=${encodeURIComponent(result.email)}` : "";
    return NextResponse.redirect(new URL(`/login?verified=true${emailParam}`, req.url));
  } else {
    const errorReason = encodeURIComponent(result.error || "Verification link is invalid or expired.");
    return NextResponse.redirect(new URL(`/login?error=VerificationFailed&message=${errorReason}`, req.url));
  }
}
