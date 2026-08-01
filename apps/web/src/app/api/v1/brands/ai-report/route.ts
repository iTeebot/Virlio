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

    const report = await brandService.generateReadinessReport(brandData || {}, evidenceData || {});
    return apiSuccess(report);
  } catch (error: any) {
    return apiError(error.message || "Failed to generate AI brand report", 500);
  }
}
