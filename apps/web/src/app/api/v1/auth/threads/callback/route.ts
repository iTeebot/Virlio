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
  const origin = getRequestOrigin(req);

  try {
    const session = await authService.getCurrentSession();
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const stateEncoded = searchParams.get("state");

    let brandId = "";
    if (stateEncoded) {
      try {
        const decoded = JSON.parse(Buffer.from(stateEncoded, "base64url").toString("utf8"));
        brandId = decoded.brandId || "";
      } catch {
        brandId = "";
      }
    }

    const redirectUri = `${origin}/api/v1/auth/threads/callback`;

    if (brandId) {
      await threadsOAuthService.handleCallback(
        brandId,
        code || "mock_code",
        redirectUri,
        session?.user?.id
      );
    }

    const targetUrl = brandId
      ? `${origin}/dashboard/brands/${brandId}/socials?threads_connected=1`
      : `${origin}/dashboard/brands`;

    return NextResponse.redirect(targetUrl);
  } catch (error: any) {
    console.error("[Threads OAuth Callback Error]:", error);
    return NextResponse.redirect(`${origin}/dashboard/brands?oauth_error=1`);
  }
}
