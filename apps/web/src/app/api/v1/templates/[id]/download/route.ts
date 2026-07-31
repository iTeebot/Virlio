import { NextRequest } from "next/server";
import { apiSuccess, apiError, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { eq, and, sql, isNull } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: paramIdentifier } = await params;

    const isUuid = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(paramIdentifier);
    const condition = isUuid ? eq(templates.id, paramIdentifier) : eq(templates.slug, paramIdentifier);

    const targetTemplate = await db.query.templates.findFirst({
      where: and(isNull(templates.deleted_at), condition),
    });

    if (!targetTemplate) {
      return apiNotFound("Template not found");
    }

    // Increment downloads count in database
    await db
      .update(templates)
      .set({ downloads_count: sql`COALESCE(${templates.downloads_count}, 0) + 1` })
      .where(eq(templates.id, targetTemplate.id));

    return apiSuccess({
      success: true,
      downloads_count: (targetTemplate.downloads_count || 0) + 1,
      cloudinary_secure_url: targetTemplate.cloudinary_secure_url,
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to record download", 500);
  }
}
