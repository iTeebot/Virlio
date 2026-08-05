import { db } from "@virlio/database";
import { memeGenerations } from "@virlio/database/schema";
import { eq, desc, and, gte } from "drizzle-orm";

export interface GenerationRecord {
  brandId: string;
  userId: string;
  topic: string;
  campaignName?: string;
  targetAudience?: string;
  marketingGoal?: string;
  tone?: string;
  cta?: string;
  additionalNotes?: string;
  memeCount: number;
  promptVersion: string;
}

export interface GenerationResult {
  providerUsed: string;
  modelUsed: string;
  generationTimeMs: number;
  totalTokens: number;
  status: "completed" | "failed";
  errorMessage?: string;
}

/**
 * Records meme generation batch metadata to the meme_generations table
 * for analytics, cost tracking, and audit trail.
 */
export async function recordGeneration(
  record: GenerationRecord,
  result: GenerationResult
): Promise<string> {
  const [row] = await db
    .insert(memeGenerations)
    .values({
      brand_id: record.brandId,
      user_id: record.userId,
      topic: record.topic,
      campaign_name: record.campaignName || null,
      target_audience: record.targetAudience || null,
      marketing_goal: record.marketingGoal || null,
      tone: record.tone || null,
      cta: record.cta || null,
      additional_notes: record.additionalNotes || null,
      meme_count: record.memeCount,
      provider_used: result.providerUsed,
      model_used: result.modelUsed,
      generation_time_ms: result.generationTimeMs,
      total_tokens: result.totalTokens,
      prompt_version: record.promptVersion,
      status: result.status,
      error_message: result.errorMessage || null,
    })
    .returning();

  return row.id;
}

/**
 * Retrieves generation statistics for a brand.
 */
export async function getGenerationStats(brandId: string) {
  const generations = await db.query.memeGenerations.findMany({
    where: eq(memeGenerations.brand_id, brandId),
    orderBy: desc(memeGenerations.created_at),
    limit: 100,
  });

  const total = generations.length;
  const completed = generations.filter((g) => g.status === "completed").length;
  const failed = generations.filter((g) => g.status === "failed").length;
  const totalTokens = generations.reduce((sum, g) => sum + (g.total_tokens || 0), 0);
  const avgTimeMs = total > 0
    ? Math.round(generations.reduce((sum, g) => sum + (g.generation_time_ms || 0), 0) / total)
    : 0;

  const providerBreakdown: Record<string, number> = {};
  for (const g of generations) {
    if (g.provider_used) {
      providerBreakdown[g.provider_used] = (providerBreakdown[g.provider_used] || 0) + 1;
    }
  }

  return {
    totalGenerations: total,
    completedGenerations: completed,
    failedGenerations: failed,
    successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    totalTokensUsed: totalTokens,
    averageGenerationTimeMs: avgTimeMs,
    providerBreakdown,
    recentGenerations: generations.slice(0, 10),
  };
}

/**
 * Counts published memes for the current month for quota enforcement.
 */
export async function getMonthlyPublishCount(userId: string): Promise<number> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const generations = await db.query.memeGenerations.findMany({
    where: and(
      eq(memeGenerations.user_id, userId),
      eq(memeGenerations.status, "completed"),
      gte(memeGenerations.created_at, startOfMonth)
    ),
  });

  return generations.reduce((sum, g) => sum + (g.meme_count || 0), 0);
}
