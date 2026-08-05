import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services";

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

    // Strictly use the Instagram App ID for Virlio-IG (1804628770539559)
    const igAppId = process.env.AUTH_INSTAGRAM_ID || "1804628770539559";

    const origin = new URL(req.url).origin;
    const redirectUri = `${origin}/api/v1/auth/instagram/callback`;
    const state = Buffer.from(JSON.stringify({ brandId, ts: Date.now() })).toString("base64url");

    // Instagram Business API Scopes
    const scopes = ["instagram_business_basic", "instagram_business_content_publish"].join(",");

    const params = new URLSearchParams({
      client_id: igAppId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
      state,
    });

    // Official Instagram OAuth authorize endpoint
    const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to initiate Instagram OAuth" }, { status: 500 });
  }
}
