import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { isNull, eq, and, sql } from "drizzle-orm";
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

    // 2. Aggregate counts from DB for approved public templates only
    const rows = await db
      .select({
        category: templates.category,
        count: sql<number>`count(*)::int`,
      })
      .from(templates)
      .where(
        and(
          isNull(templates.deleted_at),
          eq(templates.visibility, "public"),
          eq(templates.moderation_status, "approved")
        )
      )
      .groupBy(templates.category);

    // Build a reverse lookup: lowercase name -> predefined slug
    const nameToSlug = new Map<string, string>();
    PREDEFINED_CATEGORIES.forEach((c) => {
      nameToSlug.set(c.name.toLowerCase(), c.slug);
      nameToSlug.set(c.slug.toLowerCase(), c.slug);
    });

    rows.forEach((r) => {
      if (r.category) {
        const rawName = r.category.trim();
        const generatedSlug = rawName.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");
        if (!generatedSlug) return;

        // Try to match to a predefined category by name or slug
        const matchedSlug =
          nameToSlug.get(rawName.toLowerCase()) ||
          nameToSlug.get(generatedSlug) ||
          null;

        if (matchedSlug) {
          // Accumulate count into predefined category
          categoryCounts[matchedSlug] = (categoryCounts[matchedSlug] || 0) + r.count;
        } else {
          // Custom category not in predefined list
          categoryCounts[generatedSlug] = (categoryCounts[generatedSlug] || 0) + r.count;

          if (!categoryMap.has(generatedSlug)) {
            categoryMap.set(generatedSlug, {
              id: `custom-${generatedSlug}`,
              slug: generatedSlug,
              name: rawName,
              isCustom: true,
            });
          }
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
