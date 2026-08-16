import { db } from "@virlio/database";
import {
  brandGenerationSessions,
  brandPostGenerations,
  brandPostVariations,
  brandPostImageVersions,
  brandGenerationMemories,
} from "@virlio/database/schema";
import { eq, and, isNull, desc, asc, inArray } from "drizzle-orm";
import type {
  BrandGenerationSession,
  BrandPostGeneration,
  BrandPostVariation,
  BrandPostImageVersion,
  BrandGenerationMemory,
} from "@virlio/database/types";

// ==========================================
// 1. BRAND GENERATION SESSIONS
// ==========================================

export async function createSession(data: Partial<BrandGenerationSession>) {
  const [session] = await db
    .insert(brandGenerationSessions)
    .values(data as any)
    .returning();
  return session;
}

export async function findSessionById(id: string) {
  return (
    (await db.query.brandGenerationSessions.findFirst({
      where: and(eq(brandGenerationSessions.id, id), isNull(brandGenerationSessions.deleted_at)),
    })) || null
  );
}

export async function findSessionsByBrand(
  brandId: string,
  options: { limit?: number; offset?: number; status?: string } = {}
) {
  const conditions = [
    eq(brandGenerationSessions.brand_id, brandId),
    isNull(brandGenerationSessions.deleted_at),
  ];

  if (options.status) {
    conditions.push(eq(brandGenerationSessions.status, options.status));
  }

  return db.query.brandGenerationSessions.findMany({
    where: and(...conditions),
    limit: options.limit || 20,
    offset: options.offset || 0,
    orderBy: [desc(brandGenerationSessions.created_at)],
  });
}

export async function findSessionWithDetails(id: string) {
  return (
    (await db.query.brandGenerationSessions.findFirst({
      where: and(eq(brandGenerationSessions.id, id), isNull(brandGenerationSessions.deleted_at)),
      with: {
        generations: {
          orderBy: [desc(brandPostGenerations.created_at)],
          with: {
            variations: {
              orderBy: [asc(brandPostVariations.variation_index)],
              with: {
                activeVersion: {
                  with: {
                    asset: true,
                  },
                },
                imageVersions: {
                  orderBy: [desc(brandPostImageVersions.version_number)],
                  with: {
                    asset: true,
                  },
                },
              },
            },
          },
        },
        memories: {
          orderBy: [desc(brandGenerationMemories.importance_score)],
        },
      },
    })) || null
  );
}

export async function updateSession(id: string, data: Partial<BrandGenerationSession>) {
  const [session] = await db
    .update(brandGenerationSessions)
    .set({ ...data, updated_at: new Date() })
    .where(eq(brandGenerationSessions.id, id))
    .returning();
  return session || null;
}

export async function softDeleteSession(id: string) {
  const [session] = await db
    .update(brandGenerationSessions)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(brandGenerationSessions.id, id))
    .returning();
  return session || null;
}

// ==========================================
// 2. BRAND POST GENERATIONS
// ==========================================

export async function createGeneration(data: Partial<BrandPostGeneration>) {
  const [generation] = await db
    .insert(brandPostGenerations)
    .values(data as any)
    .returning();
  return generation;
}

export async function findGenerationById(id: string) {
  return (
    (await db.query.brandPostGenerations.findFirst({
      where: eq(brandPostGenerations.id, id),
      with: {
        variations: {
          orderBy: [asc(brandPostVariations.variation_index)],
          with: {
            activeVersion: true,
            imageVersions: {
              orderBy: [desc(brandPostImageVersions.version_number)],
            },
          },
        },
      },
    })) || null
  );
}

export async function findGenerationsBySession(sessionId: string) {
  return db.query.brandPostGenerations.findMany({
    where: eq(brandPostGenerations.session_id, sessionId),
    orderBy: [desc(brandPostGenerations.created_at)],
  });
}

export async function updateGenerationStatus(
  id: string,
  status: string,
  metadata: {
    errorMessage?: string;
    providerUsed?: string;
    modelUsed?: string;
    generationTimeMs?: number;
    totalTokens?: number;
    estimatedCostUsd?: string;
  } = {}
) {
  const [generation] = await db
    .update(brandPostGenerations)
    .set({
      status,
      error_message: metadata.errorMessage,
      provider_used: metadata.providerUsed,
      model_used: metadata.modelUsed,
      generation_time_ms: metadata.generationTimeMs,
      total_tokens: metadata.totalTokens,
      estimated_cost_usd: metadata.estimatedCostUsd,
      updated_at: new Date(),
    })
    .where(eq(brandPostGenerations.id, id))
    .returning();
  return generation || null;
}

// ==========================================
// 3. BRAND POST VARIATIONS
// ==========================================

export async function createVariation(data: Partial<BrandPostVariation>) {
  const [variation] = await db
    .insert(brandPostVariations)
    .values(data as any)
    .returning();
  return variation;
}

export async function createVariationsBatch(variationsList: Array<Partial<BrandPostVariation>>) {
  if (variationsList.length === 0) return [];
  return db
    .insert(brandPostVariations)
    .values(variationsList as any)
    .returning();
}

export async function findVariationById(id: string) {
  return (
    (await db.query.brandPostVariations.findFirst({
      where: eq(brandPostVariations.id, id),
      with: {
        activeVersion: {
          with: {
            asset: true,
          },
        },
        imageVersions: {
          orderBy: [desc(brandPostImageVersions.version_number)],
          with: {
            asset: true,
          },
        },
      },
    })) || null
  );
}

export async function findVariationsByGeneration(generationId: string) {
  return db.query.brandPostVariations.findMany({
    where: eq(brandPostVariations.generation_id, generationId),
    orderBy: [asc(brandPostVariations.variation_index)],
    with: {
      activeVersion: true,
      imageVersions: {
        orderBy: [desc(brandPostImageVersions.version_number)],
      },
    },
  });
}

export async function findVariationsBySession(sessionId: string) {
  return db.query.brandPostVariations.findMany({
    where: eq(brandPostVariations.session_id, sessionId),
    orderBy: [asc(brandPostVariations.variation_index)],
  });
}

export async function updateVariation(id: string, data: Partial<BrandPostVariation>) {
  const [variation] = await db
    .update(brandPostVariations)
    .set({ ...data, updated_at: new Date() })
    .where(eq(brandPostVariations.id, id))
    .returning();
  return variation || null;
}

export async function setActiveVersion(variationId: string, versionId: string) {
  const [variation] = await db
    .update(brandPostVariations)
    .set({ active_version_id: versionId, updated_at: new Date() })
    .where(eq(brandPostVariations.id, variationId))
    .returning();
  return variation || null;
}

export async function setApproved(variationId: string, isApproved: boolean) {
  const [variation] = await db
    .update(brandPostVariations)
    .set({ is_approved: isApproved, updated_at: new Date() })
    .where(eq(brandPostVariations.id, variationId))
    .returning();
  return variation || null;
}

// ==========================================
// 4. BRAND POST IMAGE VERSIONS
// ==========================================

export async function createImageVersion(data: Partial<BrandPostImageVersion>) {
  const [version] = await db
    .insert(brandPostImageVersions)
    .values(data as any)
    .returning();

  // Automatically update the variation's active_version_id to this newly created version
  if (data.variation_id && version?.id) {
    await db
      .update(brandPostVariations)
      .set({ active_version_id: version.id, updated_at: new Date() })
      .where(eq(brandPostVariations.id, data.variation_id));
  }

  return version;
}

export async function findImageVersionById(id: string) {
  return (
    (await db.query.brandPostImageVersions.findFirst({
      where: eq(brandPostImageVersions.id, id),
      with: {
        asset: true,
        variation: true,
      },
    })) || null
  );
}

export async function findImageVersionsByVariation(variationId: string) {
  return db.query.brandPostImageVersions.findMany({
    where: eq(brandPostImageVersions.variation_id, variationId),
    orderBy: [asc(brandPostImageVersions.version_number)],
    with: {
      asset: true,
    },
  });
}

export async function getLatestVersionNumber(variationId: string): Promise<number> {
  const latest = await db.query.brandPostImageVersions.findFirst({
    where: eq(brandPostImageVersions.variation_id, variationId),
    orderBy: [desc(brandPostImageVersions.version_number)],
    columns: { version_number: true },
  });

  return latest ? latest.version_number : 0;
}

export async function findImageVersionLineage(versionId: string): Promise<BrandPostImageVersion[]> {
  const lineage: BrandPostImageVersion[] = [];
  let currentId: string | null = versionId;

  while (currentId) {
    const targetId: string = currentId;
    const node: any = await db.query.brandPostImageVersions.findFirst({
      where: eq(brandPostImageVersions.id, targetId),
      with: { asset: true },
    });

    if (!node) break;
    lineage.unshift(node);
    currentId = node.parent_version_id;
  }

  return lineage;
}

// ==========================================
// 5. BRAND GENERATION MEMORIES
// ==========================================

export async function upsertMemory(
  sessionId: string,
  brandId: string,
  key: string,
  data: {
    memoryType: string;
    content: string;
    structuredData?: any;
    importanceScore?: number;
  }
) {
  const existing = await db.query.brandGenerationMemories.findFirst({
    where: and(
      eq(brandGenerationMemories.session_id, sessionId),
      eq(brandGenerationMemories.key, key)
    ),
  });

  if (existing) {
    const [updated] = await db
      .update(brandGenerationMemories)
      .set({
        content: data.content,
        structured_data: data.structuredData,
        importance_score: data.importanceScore ?? existing.importance_score,
        updated_at: new Date(),
      })
      .where(eq(brandGenerationMemories.id, existing.id))
      .returning();
    return updated;
  }

  const [created] = await db
    .insert(brandGenerationMemories)
    .values({
      session_id: sessionId,
      brand_id: brandId,
      key,
      memory_type: data.memoryType,
      content: data.content,
      structured_data: data.structuredData,
      importance_score: data.importanceScore ?? 5,
    })
    .returning();

  return created;
}

export async function findMemoriesBySession(sessionId: string) {
  return db.query.brandGenerationMemories.findMany({
    where: eq(brandGenerationMemories.session_id, sessionId),
    orderBy: [desc(brandGenerationMemories.importance_score)],
  });
}

export async function deleteMemory(id: string) {
  const [deleted] = await db
    .delete(brandGenerationMemories)
    .where(eq(brandGenerationMemories.id, id))
    .returning();
  return deleted || null;
}
