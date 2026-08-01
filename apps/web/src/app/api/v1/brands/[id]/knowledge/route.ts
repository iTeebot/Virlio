import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const kb = await brandService.getKnowledgeBase(id, session.user.id);
    return apiSuccess(kb);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch AI Knowledge Base", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const updatedKb = await brandService.updateKnowledgeBase(id, session.user.id, body);
    return apiSuccess(updatedKb);
  } catch (error: any) {
    return apiError(error.message || "Failed to update AI Knowledge Base", 500);
  }
}
