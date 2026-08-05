import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const history = await brandService.getKnowledgeBaseHistory(brandId, session.user.id);
    return apiSuccess(history);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch Brand AI history", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { historyId } = body;
    if (!historyId) return apiError("historyId is required for restoration", 400);

    const restoredKb = await brandService.restoreKnowledgeBaseVersion(brandId, session.user.id, historyId);
    return apiSuccess(restoredKb);
  } catch (error: any) {
    return apiError(error.message || "Failed to restore Brand AI version", 500);
  }
}
