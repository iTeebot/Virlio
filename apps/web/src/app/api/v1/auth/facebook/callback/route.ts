import { NextRequest, NextResponse } from "next/server";
import { facebookOAuthService } from "@/server/services/social/facebook-oauth.service";
import { discoveredPagesStore } from "@/server/services/social/discovered-pages.store";

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

    const redirectUri = `${origin}/api/v1/auth/facebook/callback`;

    // Handle OAuth callback and retrieve managed pages
    const { pages } = await facebookOAuthService.handleCallback(code || "mock_code", redirectUri);

    if (brandId) {
      discoveredPagesStore.set(brandId, pages);
    }

    // Redirect to Brand Social Connections page with facebook_select modal flag
    const targetUrl = brandId
      ? `${origin}/dashboard/brands/${brandId}/socials?facebook_select=1`
      : `${origin}/dashboard/brands`;

    return NextResponse.redirect(targetUrl);
  } catch (error: any) {
    console.error("[Meta OAuth Callback Error]:", error);
    return NextResponse.redirect(`${origin}/dashboard/brands?oauth_error=1`);
  }
}
