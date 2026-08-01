import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const result = await brandService.acceptInvitation(token, session.user.id);
    return apiSuccess(result);
  } catch (error: any) {
    return apiError(error.message || "Failed to accept invitation", 500);
  }
}
