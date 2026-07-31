import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { reports, templates } from "@virlio/database/schema";
import { eq, and, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized("Must be logged in to submit a report");

    const { id: paramIdentifier } = await params;
    const body = await req.json();
    const reason = body.reason || "inappropriate_content";
    const explanation = body.explanation || "";

    // Resolve template by UUID or Slug
    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(paramIdentifier);
    const condition = isUuid ? eq(templates.id, paramIdentifier) : eq(templates.slug, paramIdentifier);

    const targetTemplate = await db.query.templates.findFirst({
      where: and(isNull(templates.deleted_at), condition),
    });

    if (!targetTemplate) {
      return apiNotFound("Template not found");
    }

    const [report] = await db.insert(reports).values({
      reporter_id: session.user.id,
      entity_type: "template",
      entity_id: targetTemplate.id,
      reason,
      explanation,
      status: "pending",
    } as any).returning();

    return apiSuccess({ reportId: report.id, message: "Report submitted successfully for moderation review" });
  } catch (error: any) {
    return apiError(error.message || "Failed to submit report", 500);
  }
}
