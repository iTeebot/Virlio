import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandAuditLogs, brands } from "@virlio/database/schema";
import { eq, and, isNull, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const brand = await db.query.brands.findFirst({
      where: and(eq(brands.id, brandId), isNull(brands.deleted_at)),
    });

    if (!brand) return apiNotFound("Brand not found");

    const auditLogs = await db.query.brandAuditLogs.findMany({
      where: eq(brandAuditLogs.brand_id, brandId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
      },
      orderBy: [desc(brandAuditLogs.created_at)],
      limit: 50,
    });

    // If no audit logs exist yet, construct an initial "Brand Created" event from brand record
    const activities = auditLogs.length > 0
      ? auditLogs
      : [
          {
            id: `init-${brand.id}`,
            brand_id: brand.id,
            user_id: brand.owner_id,
            action: "BRAND_CREATED",
            details: { name: brand.name, slug: brand.slug },
            created_at: brand.created_at,
            user: null,
          },
        ];

    return apiSuccess(activities);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch brand activity", 500);
  }
}
