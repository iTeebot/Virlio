import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/server/services";

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

    const igAppId = process.env.AUTH_INSTAGRAM_ID || "1804628770539559";
    const origin = getRequestOrigin(req);
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

    const authUrl = `https://www.instagram.com/oauth/authorize?${params.toString()}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to initiate Instagram OAuth" }, { status: 500 });
  }
}
