import { NextRequest, NextResponse } from "next/server";
import { facebookOAuthService } from "@/server/services/social/facebook-oauth.service";
import { discoveredPagesStore } from "@/server/services/social/discovered-pages.store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/v1/auth/facebook/callback`;

    // Handle OAuth callback and retrieve managed pages
    const { pages } = await facebookOAuthService.handleCallback(code || "mock_code", redirectUri);

    if (brandId) {
      discoveredPagesStore.set(brandId, pages);
    }

    // Redirect to Brand Social Connections page with facebook_select modal flag
    const targetUrl = brandId
      ? `${appUrl}/dashboard/brands/${brandId}/socials?facebook_select=1`
      : `${appUrl}/dashboard/brands`;

    return NextResponse.redirect(targetUrl);
  } catch (error: any) {
    console.error("[Meta OAuth Callback Error]:", error);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/dashboard/brands?oauth_error=1`);
  }
}
