import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const requestStartTime = performance.now();
  const response = NextResponse.next();
  const duration = performance.now() - requestStartTime;

  response.headers.set("Server-Timing", `total;dur=${duration.toFixed(2)}`);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
