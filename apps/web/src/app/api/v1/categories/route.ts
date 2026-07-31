import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { isNull, sql } from "drizzle-orm";
import { apiSuccess } from "@/lib/utils/api-response";
import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const categoryCounts: Record<string, number> = {};
    const categoryMap = new Map<string, { id: string; slug: string; name: string; isCustom: boolean }>();

    // 1. Initialize with predefined categories
    PREDEFINED_CATEGORIES.forEach((c) => {
      categoryCounts[c.slug] = 0;
      categoryMap.set(c.slug, { id: c.id, slug: c.slug, name: c.name, isCustom: false });
    });

    // 2. Aggregate counts from DB for all categories (including user-created global categories)
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
        const rawName = r.category.trim();
        const slug = rawName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
        if (!slug) return;

        categoryCounts[slug] = r.count;

        if (!categoryMap.has(slug)) {
          categoryMap.set(slug, {
            id: `custom-${slug}`,
            slug,
            name: rawName,
            isCustom: true,
          });
        }
      }
    });

    const categoryList = Array.from(categoryMap.values()).map((item) => ({
      ...item,
      count: categoryCounts[item.slug] || 0,
    }));

    return apiSuccess({
      counts: categoryCounts,
      categories: categoryList,
    });
  } catch (error: any) {
    const fallbackList = PREDEFINED_CATEGORIES.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      count: 0,
      isCustom: false,
    }));
    return apiSuccess({ counts: {}, categories: fallbackList });
  }
}
