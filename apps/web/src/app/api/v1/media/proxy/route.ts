import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url query parameter", { status: 400 });
  }

  try {
    const mediaRes = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Virlio-Media-Proxy/1.0",
      },
    });

    if (!mediaRes.ok) {
      return new NextResponse("Failed to fetch upstream media", { status: mediaRes.status });
    }

    const contentType = mediaRes.headers.get("content-type") || "image/png";
    const arrayBuffer = await mediaRes.arrayBuffer();

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (err: any) {
    console.error("[Media Proxy Error]:", err);
    return new NextResponse(err.message || "Media proxy error", { status: 500 });
  }
}
