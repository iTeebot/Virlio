import { db } from "@virlio/database";
import { brands, brandKnowledgeBases } from "@virlio/database/schema";
import { eq } from "drizzle-orm";

export interface BrandContext {
  brandId: string;
  name: string;
  slug: string;
  description: string;
  industry: string;
  subIndustry: string;
  country: string;
  language: string;
  website: string;
  // Knowledge Base
  identity: Record<string, any> | null;
  brandVoice: Record<string, any> | null;
  audience: Record<string, any> | null;
  restrictions: Record<string, any> | null;
  campaigns: Record<string, any> | null;
  preferredCTAs: Record<string, any> | null;
  keywords: Record<string, any> | null;
  hashtags: Record<string, any> | null;
  competitors: Record<string, any> | null;
  // Metadata
  socialLinks: Record<string, any> | null;
  settings: Record<string, any> | null;
}

/**
 * Builds a complete brand context object from the brands table
 * and the brand knowledge base. This flat context is injected
 * directly into the meme generation prompt.
 */
export async function buildBrandContext(brandId: string): Promise<BrandContext> {
  const brand = await db.query.brands.findFirst({
    where: eq(brands.id, brandId),
  });

  if (!brand) {
    throw new Error(`Brand not found: ${brandId}`);
  }

  const kb = await db.query.brandKnowledgeBases.findFirst({
    where: eq(brandKnowledgeBases.brand_id, brandId),
  });

  return {
    brandId: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description || "",
    industry: brand.industry || "General",
    subIndustry: brand.sub_industry || "",
    country: brand.country || "Global",
    language: brand.language || "en",
    website: brand.website || "",
    identity: (kb?.identity as Record<string, any>) || null,
    brandVoice: (kb?.brand_voice as Record<string, any>) || null,
    audience: (kb?.audience as Record<string, any>) || null,
    restrictions: (kb?.restrictions as Record<string, any>) || null,
    campaigns: (kb?.campaigns as Record<string, any>) || null,
    preferredCTAs: (kb?.preferred_ctas as Record<string, any>) || null,
    keywords: (kb?.keywords as Record<string, any>) || null,
    hashtags: (kb?.hashtags_approved as Record<string, any>) || null,
    competitors: (kb?.competitors as Record<string, any>) || null,
    socialLinks: (brand.social_links as Record<string, any>) || null,
    settings: (brand.settings as Record<string, any>) || null,
  };
}
