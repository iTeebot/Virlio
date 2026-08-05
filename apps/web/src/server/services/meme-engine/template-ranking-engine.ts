import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { eq, isNull, and, desc, sql } from "drizzle-orm";
import type { BrandContext } from "./brand-context-builder";

export interface RankedTemplate {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  subcategory: string | null;
  tags: string[];
  aiTags: string[];
  language: string | null;
  country: string | null;
  aiSummary: string | null;
  ocrText: string | null;
  textLayout: string | null;
  aiGenerationProfile: Record<string, any> | null;
  imageUrl: string | null;
  qualityScore: number;
  trendingScore: number;
  upvotesCount: number;
  createdAt: Date;
  // Computed
  relevanceScore: number;
}

/**
 * Template Ranking Engine.
 *
 * Scores and ranks approved public templates by relevance to the brand
 * and topic. The AI then selects 4 from the top-ranked candidates.
 *
 * This engine reads the pre-computed AI Generation Profile stored on each
 * template (set once during approval) rather than inferring layout/style
 * on every generation request.
 */
export async function rankTemplates(
  brandContext: BrandContext,
  topic: string,
  limit: number = 12
): Promise<RankedTemplate[]> {
  // Fetch all approved public templates
  const rows = await db.query.templates.findMany({
    where: and(
      isNull(templates.deleted_at),
      eq(templates.visibility, "public"),
      eq(templates.moderation_status, "approved")
    ),
    orderBy: [desc(templates.upvotes_count), desc(templates.trending_score), desc(templates.created_at)],
    limit: 200, // Pre-filter: fetch up to 200 for scoring
  });

  if (rows.length === 0) {
    return [];
  }

  const topicWords = topic.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const brandIndustry = brandContext.industry.toLowerCase();
  const brandCountry = brandContext.country.toLowerCase();
  const brandLanguage = brandContext.language.toLowerCase();

  const scored = rows.map((tpl) => {
    let score = 0;

    // 1. Category match (20%)
    const tplCategory = (tpl.category || "").toLowerCase();
    if (tplCategory && brandIndustry.includes(tplCategory)) {
      score += 20;
    } else if (tplCategory === "general") {
      score += 8;
    }

    // 2. Tag overlap (15%)
    const tplTags = Array.isArray(tpl.tags) ? (tpl.tags as string[]).map((t) => t.toLowerCase()) : [];
    const aiTags = Array.isArray(tpl.ai_tags) ? (tpl.ai_tags as string[]).map((t) => t.toLowerCase()) : [];
    const allTags = [...tplTags, ...aiTags];
    const tagOverlap = topicWords.filter((w) => allTags.some((t) => t.includes(w))).length;
    score += Math.min(tagOverlap * 5, 15);

    // 3. Language match (10%)
    if ((tpl.language || "en").toLowerCase() === brandLanguage) {
      score += 10;
    }

    // 4. Country match (5%)
    if ((tpl.country || "global").toLowerCase() === brandCountry || (tpl.country || "").toLowerCase() === "global") {
      score += 5;
    }

    // 5. Popularity - upvotes (15%)
    const upvotes = tpl.upvotes_count || 0;
    score += Math.min(Math.round((upvotes / Math.max(upvotes, 100)) * 15), 15);

    // 6. Quality score (15%)
    const quality = tpl.quality_score || 0;
    score += Math.round((quality / 100) * 15);

    // 7. Trending score (10%)
    const trending = tpl.trending_score || 0;
    score += Math.min(Math.round((trending / Math.max(trending, 100)) * 10), 10);

    // 8. Recency (5%)
    const ageMs = Date.now() - new Date(tpl.created_at).getTime();
    const ageDays = ageMs / (1000 * 60 * 60 * 24);
    if (ageDays < 7) score += 5;
    else if (ageDays < 30) score += 3;
    else if (ageDays < 90) score += 1;

    // 9. Topic keyword match in title/description/ai_summary (5%)
    const searchText = `${tpl.title} ${tpl.description || ""} ${tpl.ai_summary || ""}`.toLowerCase();
    const keywordHits = topicWords.filter((w) => searchText.includes(w)).length;
    score += Math.min(keywordHits * 2, 5);

    // 10. AI Generation Profile bonus (emotion/style matching)
    const profile = tpl.ai_generation_profile as Record<string, any> | null;
    if (profile) {
      // Bonus for templates with generation profiles (they're better classified)
      score += 3;
      // Bonus if bestFor tags match topic
      const bestFor = Array.isArray(profile.bestFor)
        ? profile.bestFor.map((b: string) => b.toLowerCase())
        : [];
      const bestForHits = topicWords.filter((w) => bestFor.some((b: string) => b.includes(w))).length;
      score += Math.min(bestForHits * 2, 4);
    }

    return {
      id: tpl.id,
      title: tpl.title,
      slug: tpl.slug,
      description: tpl.description,
      category: tpl.category,
      subcategory: tpl.subcategory,
      tags: tplTags,
      aiTags,
      language: tpl.language,
      country: tpl.country,
      aiSummary: tpl.ai_summary,
      ocrText: tpl.ocr_text,
      textLayout: tpl.text_layout || "top_bottom",
      aiGenerationProfile: profile,
      imageUrl: tpl.cloudinary_secure_url,
      qualityScore: tpl.quality_score || 0,
      trendingScore: tpl.trending_score || 0,
      upvotesCount: tpl.upvotes_count || 0,
      createdAt: tpl.created_at,
      relevanceScore: Math.min(score, 100),
    } satisfies RankedTemplate;
  });

  // Sort by relevance score descending
  scored.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scored.slice(0, limit);
}
