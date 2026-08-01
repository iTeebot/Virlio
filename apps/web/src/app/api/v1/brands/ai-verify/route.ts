import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { brandData, evidenceData } = body;

    const confidenceResult = await brandService.calculateVerificationConfidence(brandData || {}, evidenceData || {});
    return apiSuccess(confidenceResult);
  } catch (error: any) {
    return apiError(error.message || "Failed to calculate verification confidence", 500);
  }
}
