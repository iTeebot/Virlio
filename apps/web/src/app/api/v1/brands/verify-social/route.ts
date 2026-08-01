import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";
import { socialVerificationService } from "@/lib/social-verification/social-verification.service";
import { SocialPlatform } from "@/lib/social-verification/types";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platform, input } = body;

    if (!platform || typeof platform !== "string") {
      return NextResponse.json({ message: "Platform is required" }, { status: 400 });
    }

    if (!input || typeof input !== "string" || !input.trim()) {
      return NextResponse.json({ message: "Input handle or URL is required" }, { status: 400 });
    }

    const clientIp = request.headers.get("x-forwarded-for") || "anon";

    const result = await socialVerificationService.verify(platform as SocialPlatform, input.trim(), clientIp);

    return NextResponse.json({
      data: result,
      message: result.exists
        ? `Successfully checked ${platform} profile @${result.username}`
        : result.error || "Profile could not be verified automatically.",
    });
  } catch (error: any) {
    console.error("Social verification API error:", error);
    return NextResponse.json({ message: error.message || "Failed to verify social profile" }, { status: 500 });
  }
}
