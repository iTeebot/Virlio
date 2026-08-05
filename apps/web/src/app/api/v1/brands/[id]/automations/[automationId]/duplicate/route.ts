import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandAutomations, brandAutomationVersions } from "@virlio/database/schema";
import { eq, and, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; automationId: string }> }
) {
  try {
    const { id: brandId, automationId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const original = await db.query.brandAutomations.findFirst({
      where: and(eq(brandAutomations.id, automationId), eq(brandAutomations.brand_id, brandId)),
    });

    if (!original) return apiNotFound("Automation not found");

    const latestVersion = await db.query.brandAutomationVersions.findFirst({
      where: eq(brandAutomationVersions.automation_id, automationId),
      orderBy: [desc(brandAutomationVersions.version)],
    });

    // Create duplicate master record
    const [duplicated] = await db
      .insert(brandAutomations)
      .values({
        brand_id: brandId,
        name: `${original.name} (Copy)`,
        description: original.description,
        status: "draft",
        is_enabled: false,
        trigger_type: original.trigger_type,
        node_count: original.node_count,
        run_count: 0,
        created_by: session.user.id,
      })
      .returning();

    // Create version 1 with copied graph data
    if (latestVersion) {
      await db.insert(brandAutomationVersions).values({
        automation_id: duplicated.id,
        version: 1,
        graph_data: latestVersion.graph_data,
        created_by: session.user.id,
      });
    }

    return apiSuccess(duplicated, 201);
  } catch (error: any) {
    return apiError(error.message || "Failed to duplicate automation", 500);
  }
}
