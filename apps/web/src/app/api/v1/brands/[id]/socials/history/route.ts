import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { publishingHistory } from "@virlio/database/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const history = await db.query.publishingHistory.findMany({
      where: eq(publishingHistory.brand_id, brandId),
      orderBy: [desc(publishingHistory.published_at)],
    });

    return apiSuccess(history);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch publishing history", 500);
  }
}
