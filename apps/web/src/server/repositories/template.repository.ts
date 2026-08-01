import { db } from "@virlio/database";
import { templates, templateModerationLogs, cloudAssets, activities } from "@virlio/database/schema";
import { eq, isNull, and, desc, asc, or, ilike, sql } from "drizzle-orm";
import type { Template } from "@virlio/database/types";

export async function findById(id: string) {
  return (await db.query.templates.findFirst({ where: and(eq(templates.id, id), isNull(templates.deleted_at)) })) || null;
}

export async function findBySlug(slug: string) {
  const result = await db.query.templates.findFirst({
    where: and(eq(templates.slug, slug), isNull(templates.deleted_at)),
    with: {
      uploader: {
        columns: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!result) return null;

  return {
    ...result,
    contributor_username: result.uploader?.username || result.uploader?.name || "creator",
  };
}

export async function findByCategory(category: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(eq(templates.category, category), isNull(templates.deleted_at)),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}

export async function findByContributor(userId: string, options: { limit?: number; offset?: number } = {}) {
  const result = await db.query.templates.findMany({
    where: and(eq(templates.uploaded_by, userId), isNull(templates.deleted_at)),
    with: {
      uploader: {
        columns: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
    limit: options.limit || 50,
    offset: options.offset || 0,
    orderBy: desc(templates.created_at),
  });

  const enriched = await Promise.all(
    result.map(async (tpl: any) => {
      let imageUrl = tpl.cloudinary_secure_url;
      let originalSlug = tpl.slug;

      if (tpl.duplicate_of_template_id) {
        const original = await findById(tpl.duplicate_of_template_id);
        if (original) {
          if (!imageUrl) imageUrl = original.cloudinary_secure_url;
          originalSlug = original.slug;
        }
      }

      return {
        ...tpl,
        cloudinary_secure_url: imageUrl || "",
        duplicate_of_slug: originalSlug,
        contributor_username: tpl.uploader?.username || tpl.uploader?.name || "creator",
      };
    })
  );

  return enriched;
}

import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";

export async function findPublicTemplates(options: { limit?: number; offset?: number; category?: string } = {}) {
  try {
    const whereConditions: any[] = [
      isNull(templates.deleted_at),
      eq(templates.visibility, "public"),
      eq(templates.moderation_status, "approved"),
    ];

    if (options.category && options.category.toLowerCase() !== "all") {
      const rawCat = options.category.trim();
      const matchedPredefined = PREDEFINED_CATEGORIES.find(
        (c) => c.slug.toLowerCase() === rawCat.toLowerCase() || c.name.toLowerCase() === rawCat.toLowerCase()
      );

      const targetName = matchedPredefined?.name || rawCat;
      const targetSlug = matchedPredefined?.slug || rawCat.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "");

      whereConditions.push(
        or(
          ilike(templates.category, targetName),
          ilike(templates.category, rawCat),
          ilike(templates.category, targetSlug),
          sql`lower(replace(replace(${templates.category}, '&', ''), ' ', '-')) = lower(replace(replace(${rawCat}, '&', ''), ' ', '-'))`
        )
      );
    }

    const result = await db.query.templates.findMany({
      where: and(...whereConditions),
      with: {
        uploader: {
          columns: {
            id: true,
            username: true,
            name: true,
            image: true,
          },
        },
      },
      limit: options.limit || 50,
      offset: options.offset || 0,
      orderBy: [desc(templates.upvotes_count), desc(templates.downloads_count), desc(templates.created_at)],
    });

    return result.map((tpl: any) => ({
      ...tpl,
      contributor_username: tpl.uploader?.username || tpl.uploader?.name || "creator",
    }));
  } catch (error) {
    console.error("[findPublicTemplates Error]", error);
    try {
      const fallbackRows = await db
        .select()
        .from(templates)
        .where(and(isNull(templates.deleted_at), eq(templates.visibility, "public")))
        .limit(options.limit || 50)
        .offset(options.offset || 0);

      return fallbackRows.map((tpl: any) => ({ ...tpl, contributor_username: "creator" }));
    } catch {
      return [];
    }
  }
}

export async function findExistingHashes() {
  try {
    return await db.select({ id: templates.id, sha256_hash: templates.sha256_hash, phash: templates.phash, original_sha256: templates.original_sha256, canonical_image_sha256: templates.canonical_image_sha256, perceptual_hash: templates.perceptual_hash }).from(templates).where(isNull(templates.deleted_at));
  } catch (err) {
    console.warn("[Repository] findExistingHashes fallback:", err);
    return [];
  }
}

export async function findByOriginalSha256(hash: string) {
  if (!hash) return null;
  const match = await db.query.templates.findFirst({
    where: and(
      isNull(templates.deleted_at),
      or(eq(templates.original_sha256, hash), eq(templates.sha256_hash, hash))
    ),
    orderBy: [
      desc(sql`CASE WHEN ${templates.visibility} = 'public' THEN 1 ELSE 0 END`),
      asc(templates.created_at),
    ],
    with: {
      uploader: {
        columns: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!match) return null;

  if (match.duplicate_of_template_id) {
    const canonicalOriginal = await findById(match.duplicate_of_template_id);
    if (canonicalOriginal) return canonicalOriginal;
  }

  return match;
}

export async function findByCanonicalSha256(hash: string) {
  if (!hash) return null;
  const match = await db.query.templates.findFirst({
    where: and(
      isNull(templates.deleted_at),
      eq(templates.canonical_image_sha256, hash)
    ),
    orderBy: [
      desc(sql`CASE WHEN ${templates.visibility} = 'public' THEN 1 ELSE 0 END`),
      asc(templates.created_at),
    ],
    with: {
      uploader: {
        columns: {
          id: true,
          username: true,
          name: true,
          image: true,
        },
      },
    },
  });

  if (!match) return null;

  if (match.duplicate_of_template_id) {
    const canonicalOriginal = await findById(match.duplicate_of_template_id);
    if (canonicalOriginal) return canonicalOriginal;
  }

  return match;
}

export async function findPerceptualCandidates() {
  try {
    return await db
      .select({
        id: templates.id,
        title: templates.title,
        slug: templates.slug,
        category: templates.category,
        uploaded_by: templates.uploaded_by,
        original_sha256: templates.original_sha256,
        canonical_image_sha256: templates.canonical_image_sha256,
        perceptual_hash: templates.perceptual_hash,
        phash: templates.phash,
        moderation_status: templates.moderation_status,
      })
      .from(templates)
      .where(isNull(templates.deleted_at));
  } catch (err) {
    console.warn("[Repository] findPerceptualCandidates fallback:", err);
    return [];
  }
}

export async function create(data: Partial<Template>) {
  const [template] = await db.insert(templates).values(data as any).returning();
  return template;
}

export async function recordModerationLog(log: {
  template_id: string;
  provider: string;
  model: string;
  moderation_decision: string;
  confidence_score: number;
  quality_score: number;
  risk_score: number;
  duplicate_score: number;
  reasoning: string;
  raw_ai_response?: any;
}) {
  const [entry] = await db.insert(templateModerationLogs).values(log as any).returning();
  return entry;
}

export async function recordCloudAsset(asset: {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  folder?: string;
  owner_id: string;
  entity_id: string;
}) {
  const [record] = await db.insert(cloudAssets).values({ ...asset, entity_type: "template" } as any).returning();
  return record;
}

export async function recordActivity(activity: {
  user_id: string;
  activity_type: any;
  entity_id: string;
  metadata?: any;
}) {
  const [record] = await db.insert(activities).values({ ...activity, entity_type: "template" } as any).returning();
  return record;
}

export async function update(id: string, data: Partial<Template>) {
  const [template] = await db
    .update(templates)
    .set({ ...data, updated_at: new Date() })
    .where(eq(templates.id, id))
    .returning();
  return template || null;
}

export async function softDelete(id: string) {
  const [template] = await db
    .update(templates)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(templates.id, id))
    .returning();
  return template || null;
}

export async function updateModerationStatus(id: string, status: any, metadata?: any) {
  return update(id, { moderation_status: status, approval_metadata: metadata } as any);
}

export async function incrementDownloads(id: string) {
  await db
    .update(templates)
    .set({ public_score: sql`${templates.public_score} + 1` })
    .where(eq(templates.id, id));
}

export async function search(query: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(
      isNull(templates.deleted_at),
      or(ilike(templates.title, `%${query}%`), ilike(templates.category, `%${query}%`))
    ),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}
