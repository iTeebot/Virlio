import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const draft = await brandService.getDraft(session.user.id);
    return apiSuccess(draft);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch draft", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { current_step, step_data } = body;

    const draft = await brandService.saveDraft(session.user.id, current_step || 1, step_data || {});
    return apiSuccess(draft);
  } catch (error: any) {
    return apiError(error.message || "Failed to save draft", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    await brandService.clearDraft(session.user.id);
    return apiSuccess({ message: "Draft cleared successfully" });
  } catch (error: any) {
    return apiError(error.message || "Failed to clear draft", 500);
  }
}
