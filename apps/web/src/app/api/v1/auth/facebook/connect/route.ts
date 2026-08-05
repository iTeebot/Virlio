import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services";
import { facebookOAuthService } from "@/server/services/social/facebook-oauth.service";

export const dynamic = "force-dynamic";

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

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/v1/auth/facebook/callback`;
    const authUrl = facebookOAuthService.getAuthorizationUrl(brandId, redirectUri);

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to initiate Meta OAuth" }, { status: 500 });
  }
}
