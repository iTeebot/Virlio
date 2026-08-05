import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandSocialConnections } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; connectionId: string }> }
) {
  try {
    const { id: brandId, connectionId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const connection = await db.query.brandSocialConnections.findFirst({
      where: and(eq(brandSocialConnections.id, connectionId), eq(brandSocialConnections.brand_id, brandId)),
    });

    if (!connection) return apiNotFound("Social connection not found");

    // Remove encrypted credentials while keeping publishing history intact
    await db.delete(brandSocialConnections).where(eq(brandSocialConnections.id, connectionId));

    return apiSuccess({ message: "Social connection disconnected", id: connectionId });
  } catch (error: any) {
    return apiError(error.message || "Failed to disconnect social account", 500);
  }
}
