import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/server/repositories";
import { withErrorHandling } from "@/lib/server/api-wrapper";
import { apiSuccess } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10), 1), 100);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

  const profiles = await userRepository.findPublicProfiles({ limit, offset });
  return apiSuccess(profiles);
});
