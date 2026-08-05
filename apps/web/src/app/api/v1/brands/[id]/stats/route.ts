import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { memes, brands, brandMembers } from "@virlio/database/schema";
import { eq, and, isNull, count, sql, desc } from "drizzle-orm";

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

    // Fetch all non-deleted memes for this brand
    const brandMemes = await db.query.memes.findMany({
      where: and(eq(memes.brand_id, brandId), isNull(memes.deleted_at)),
      orderBy: [desc(memes.created_at)],
    });

    // Valid rendered memes with images
    const renderedMemes = brandMemes.filter(
      (m) => m.status === "accepted" && m.cloudinary_secure_url && m.cloudinary_secure_url.trim().length > 0
    );

    const total_memes = brandMemes.length;
    const public_memes = brandMemes.filter((m) => m.visibility === "public").length;
    const draft_memes = brandMemes.filter((m) => m.status === "draft").length;
    const published_memes = brandMemes.filter((m) => m.publish_timestamp !== null || m.visibility === "public").length;
    const pending_memes = brandMemes.filter((m) => m.approval_status === "pending").length;

    // Total upvotes
    const total_upvotes = brandMemes.reduce((acc, m) => acc + (m.engagement_score || 0), 0);

    // Estimated views formula
    const total_views = brandMemes.reduce((acc, m) => acc + Math.max(12, (m.engagement_score || 0) * 7 + 5), 0);

    // Most used template
    const templateCounts: Record<string, number> = {};
    brandMemes.forEach((m) => {
      if (m.template_id) templateCounts[m.template_id] = (templateCounts[m.template_id] || 0) + 1;
    });

    let topTemplateId: string | null = null;
    let topTemplateCount = 0;
    Object.entries(templateCounts).forEach(([tid, cnt]) => {
      if (cnt > topTemplateCount) {
        topTemplateCount = cnt;
        topTemplateId = tid;
      }
    });

    let most_used_template = null;
    if (topTemplateId) {
      const { templates: templatesTable } = await import("@virlio/database/schema");
      const tpl = await db.query.templates.findFirst({
        where: eq(templatesTable.id, topTemplateId),
      });
      if (tpl) {
        most_used_template = {
          id: tpl.id,
          title: tpl.title,
          url: tpl.cloudinary_secure_url,
          count: topTemplateCount,
        };
      }
    }

    // Top performing meme (only from valid rendered memes)
    const topMeme = [...renderedMemes].sort((a, b) => (b.engagement_score || 0) - (a.engagement_score || 0))[0] || null;

    // Members count
    const membersCount = await db
      .select({ count: count() })
      .from(brandMembers)
      .where(and(eq(brandMembers.brand_id, brandId), isNull(brandMembers.deleted_at)));

    return apiSuccess({
      brand_id: brandId,
      total_memes,
      public_memes,
      draft_memes,
      published_memes,
      pending_memes,
      total_upvotes,
      total_views,
      followers_count: 0,
      managers_count: membersCount[0]?.count || 1,
      brand_score: brand.brand_score || 100,
      verification_status: brand.verification_status,
      most_used_template,
      top_performing_meme: topMeme,
      recent_memes: renderedMemes.slice(0, 6),
    });
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch brand statistics", 500);
  }
}
