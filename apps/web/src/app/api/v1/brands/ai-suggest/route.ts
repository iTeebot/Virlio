import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { step, field, currentValue, brandContext, extractLogo, logoUrl } = body;

    if (extractLogo && logoUrl) {
      const identity = await brandService.extractLogoIdentity(logoUrl, brandContext || {});
      return apiSuccess(identity);
    }

    if (!field) {
      return apiError("Missing required field parameter", 400);
    }

    const suggestion = await brandService.generateAISuggestion(step || 1, field, currentValue || "", brandContext || {});
    return apiSuccess(suggestion);
  } catch (error: any) {
    return apiError(error.message || "Failed to generate AI suggestion", 500);
  }
}
