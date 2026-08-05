import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const targetUrl = new URL(`/api/v1/auth/tiktok/callback${url.search}`, req.url);
  return NextResponse.redirect(targetUrl);
}
