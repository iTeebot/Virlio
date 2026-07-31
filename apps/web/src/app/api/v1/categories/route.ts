import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { isNull, sql } from "drizzle-orm";
import { apiSuccess, apiError } from "@/lib/utils/api-response";
import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Count templates per category from database
    const categoryCounts: Record<string, number> = {};

    PREDEFINED_CATEGORIES.forEach((c) => {
      categoryCounts[c.slug] = 0;
    });

    const rows = await db
      .select({
        category: templates.category,
        count: sql<number>`count(*)::int`,
      })
      .from(templates)
      .where(isNull(templates.deleted_at))
      .groupBy(templates.category);

    rows.forEach((r) => {
      if (r.category) {
        const slug = r.category.toLowerCase().replace(/ /g, "-");
        categoryCounts[slug] = r.count;
      }
    });

    return apiSuccess(categoryCounts);
  } catch (error: any) {
    // Return 0 for all predefined categories on fallback
    const fallback: Record<string, number> = {};
    PREDEFINED_CATEGORIES.forEach((c) => {
      fallback[c.slug] = 0;
    });
    return apiSuccess(fallback);
  }
}
