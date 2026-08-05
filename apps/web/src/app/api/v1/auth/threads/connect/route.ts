import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services";
import { threadsOAuthService } from "@/server/services/social/threads-oauth.service";

export const dynamic = "force-dynamic";

function getRequestOrigin(req: NextRequest): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }

  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || (req.url.startsWith("https") ? "https" : "http");

  if (host) {
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}

export async function GET(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) {
      return NextResponse.redirect(new URL("/sign-in", req.url));
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId");
    if (!brandId) {
      return NextResponse.json({ error: "Missing brandId parameter" }, { status: 400 });
    }

    const origin = getRequestOrigin(req);
    const redirectUri = `${origin}/api/v1/auth/threads/callback`;
    const authUrl = threadsOAuthService.getAuthorizationUrl(brandId, redirectUri);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to initiate Threads OAuth" }, { status: 500 });
  }
}
