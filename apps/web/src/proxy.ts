import { NextResponse, type NextRequest } from "next/server";

/**
 * Next.js 16 Proxy convention (formerly middleware)
 * Attaches microsecond Server-Timing HTTP response headers
 */
export function proxy(request: NextRequest) {
  const requestStartTime = performance.now();
  const response = NextResponse.next();
  const duration = performance.now() - requestStartTime;

  response.headers.set("Server-Timing", `total;dur=${duration.toFixed(2)}`);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
