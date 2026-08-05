import { NextRequest, NextResponse } from "next/server";
import { db } from "@virlio/database";
import { brandSocialConnections } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    console.log("[Threads Deauthorize Callback Received]:", bodyText);

    // Meta sends signed_request or JSON body upon app deauthorization
    const searchParams = new URLSearchParams(bodyText);
    const signedRequest = searchParams.get("signed_request");

    if (signedRequest) {
      try {
        const parts = signedRequest.split(".");
        if (parts[1]) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString("utf8"));
          const userId = payload.user_id;

          if (userId) {
            await db
              .update(brandSocialConnections)
              .set({ is_active: false, updated_at: new Date() })
              .where(
                and(
                  eq(brandSocialConnections.platform, "threads"),
                  eq(brandSocialConnections.page_id, userId)
                )
              );
          }
        }
      } catch (e) {
        console.warn("[Threads Deauthorize Payload Parse Error]:", e);
      }
    }

    return NextResponse.json({ success: true, message: "Deauthorized successfully" });
  } catch (error: any) {
    console.error("[Threads Deauthorize Route Error]:", error);
    return NextResponse.json({ success: true }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Threads Deauthorize Callback Endpoint Ready" });
}
