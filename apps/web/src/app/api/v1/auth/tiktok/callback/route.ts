import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services";
import { tiktokOAuthService } from "@/server/services/social/tiktok-oauth.service";

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
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const origin = getRequestOrigin(req);
  const redirectUri = `${origin}/api/v1/auth/tiktok/callback`;

  let brandId = "";
  if (state) {
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
      brandId = decoded.brandId;
    } catch (e) {
      console.warn("[TikTok OAuth Callback State Parse Warning]:", e);
    }
  }

  const fallbackRedirect = brandId
    ? `${origin}/dashboard/brands/${brandId}/socials`
    : `${origin}/dashboard`;

  if (error) {
    console.error("[TikTok OAuth Callback Error]:", error, errorDescription);
    return NextResponse.redirect(`${fallbackRedirect}?error=${encodeURIComponent(errorDescription || error)}`);
  }

  if (!code) {
    return NextResponse.redirect(`${fallbackRedirect}?error=missing_code`);
  }

  try {
    const session = await authService.getCurrentSession();
    const userId = session?.user?.id;

    const result = await tiktokOAuthService.handleCallback(brandId, code, redirectUri, userId);

    return NextResponse.redirect(
      `${origin}/dashboard/brands/${brandId}/socials?tiktok_connected=1&username=${encodeURIComponent(result.username)}`
    );
  } catch (err: any) {
    console.error("[TikTok OAuth Callback Handler Exception]:", err);
    return NextResponse.redirect(`${fallbackRedirect}?error=${encodeURIComponent(err.message || "tiktok_oauth_failed")}`);
  }
}
