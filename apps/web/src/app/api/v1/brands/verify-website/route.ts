import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";
import {
  normalizeDomain,
  generateVerificationToken,
  detectDNSProvider,
  checkDNSOwnership,
  checkHTMLMetaOwnership,
  WebsiteVerificationResult,
} from "@/lib/services/website-verification.service";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { website } = body;

    if (!website || typeof website !== "string" || !website.trim()) {
      return NextResponse.json({ message: "Website URL is required" }, { status: 400 });
    }

    const { fullUrl, hostname } = normalizeDomain(website);

    if (!hostname || hostname.length < 3) {
      return NextResponse.json({ message: "Invalid domain or hostname." }, { status: 400 });
    }

    const token = generateVerificationToken(hostname);
    const provider = await detectDNSProvider(hostname);

    // Live Ownership Verification Check
    const isDnsVerified = await checkDNSOwnership(hostname, token);
    const isMetaVerified = !isDnsVerified ? await checkHTMLMetaOwnership(fullUrl, token) : false;

    const isVerified = isDnsVerified || isMetaVerified;
    const method = isDnsVerified ? "dns_txt" : isMetaVerified ? "html_meta" : null;

    const responseData: WebsiteVerificationResult = {
      verified: isVerified,
      method,
      verifiedAt: isVerified ? new Date().toISOString() : null,
      domain: hostname,
      token,
      provider,
      error: isVerified
        ? undefined
        : "Verification record not detected yet. DNS propagation can take 1-5 minutes. Please ensure the TXT record or Meta tag is placed correctly and click 'Verify Again'.",
    };

    return NextResponse.json({
      data: responseData,
      message: isVerified
        ? `Website ownership verified for ${hostname} via ${method === "dns_txt" ? "DNS TXT Record" : "HTML Meta Tag"}!`
        : `Ownership pending for ${hostname}. Instructions provided.`,
    });
  } catch (error: any) {
    console.error("Website verification API error:", error);
    return NextResponse.json({ message: error.message || "Failed to verify website ownership" }, { status: 500 });
  }
}
