import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    console.log("[Threads Delete Data Callback Received]:", bodyText);

    const confirmationCode = crypto.randomBytes(12).toString("hex");
    const statusUrl = `https://virlio.iteebot.com/deletion-status?code=${confirmationCode}`;

    return NextResponse.json({
      url: statusUrl,
      confirmation_code: confirmationCode,
    });
  } catch (error: any) {
    console.error("[Threads Delete Data Route Error]:", error);
    const confirmationCode = `code_${Date.now()}`;
    return NextResponse.json({
      url: `https://virlio.iteebot.com/deletion-status?code=${confirmationCode}`,
      confirmation_code: confirmationCode,
    });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Threads Data Deletion Callback Endpoint Ready" });
}
