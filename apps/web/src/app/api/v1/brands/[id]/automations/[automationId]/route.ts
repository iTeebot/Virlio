import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandAutomations, brandAutomationVersions } from "@virlio/database/schema";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; automationId: string }> }
) {
  try {
    const { id: brandId, automationId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const automation = await db.query.brandAutomations.findFirst({
      where: and(eq(brandAutomations.id, automationId), eq(brandAutomations.brand_id, brandId)),
    });

    if (!automation) return apiNotFound("Automation not found");

    // Fetch latest graph version
    const latestVersion = await db.query.brandAutomationVersions.findFirst({
      where: eq(brandAutomationVersions.automation_id, automationId),
      orderBy: [desc(brandAutomationVersions.version)],
    });

    return apiSuccess({
      ...automation,
      graphData: latestVersion?.graph_data || { nodes: [], edges: [], viewport: { x: 0, y: 0, zoom: 1 } },
      version: latestVersion?.version || 1,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch automation", 500);
  }
}

const updateAutomationSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(500).optional(),
  is_enabled: z.boolean().optional(),
  status: z.enum(["draft", "enabled", "disabled"]).optional(),
  graphData: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    viewport: z.object({ x: z.number(), y: z.number(), zoom: z.number() }).optional(),
  }).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; automationId: string }> }
) {
  try {
    const { id: brandId, automationId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = updateAutomationSchema.parse(body);

    const automation = await db.query.brandAutomations.findFirst({
      where: and(eq(brandAutomations.id, automationId), eq(brandAutomations.brand_id, brandId)),
    });

    if (!automation) return apiNotFound("Automation not found");

    const updates: any = { updated_at: new Date() };

    if (parsed.name !== undefined) updates.name = parsed.name;
    if (parsed.description !== undefined) updates.description = parsed.description;
    if (parsed.is_enabled !== undefined) {
      updates.is_enabled = parsed.is_enabled;
      updates.status = parsed.is_enabled ? "enabled" : "disabled";
    }
    if (parsed.status !== undefined) updates.status = parsed.status;

    if (parsed.graphData) {
      updates.node_count = parsed.graphData.nodes.length;
      // Record new version snapshot
      const latestVersion = await db.query.brandAutomationVersions.findFirst({
        where: eq(brandAutomationVersions.automation_id, automationId),
        orderBy: [desc(brandAutomationVersions.version)],
      });

      const nextVersion = (latestVersion?.version || 1) + 1;

      await db.insert(brandAutomationVersions).values({
        automation_id: automationId,
        version: nextVersion,
        graph_data: parsed.graphData,
        created_by: session.user.id,
      });
    }

    const [updated] = await db
      .update(brandAutomations)
      .set(updates)
      .where(eq(brandAutomations.id, automationId))
      .returning();

    return apiSuccess(updated);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to update automation", 500);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; automationId: string }> }
) {
  try {
    const { id: brandId, automationId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const automation = await db.query.brandAutomations.findFirst({
      where: and(eq(brandAutomations.id, automationId), eq(brandAutomations.brand_id, brandId)),
    });

    if (!automation) return apiNotFound("Automation not found");

    // Delete version history and executions first
    await db.delete(brandAutomationVersions).where(eq(brandAutomationVersions.automation_id, automationId));
    await db.delete(brandAutomations).where(eq(brandAutomations.id, automationId));

    return apiSuccess({ message: "Automation deleted successfully", id: automationId });
  } catch (error: any) {
    return apiError(error.message || "Failed to delete automation", 500);
  }
}
