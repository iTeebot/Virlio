import { db } from "@virlio/database";
import { memes } from "@virlio/database/schema";
import { MemeGenerationProvider } from "@virlio/ai";
import type { MemeCandidate } from "@virlio/ai";

import { buildBrandContext, type BrandContext } from "./brand-context-builder";
import { rankTemplates, type RankedTemplate } from "./template-ranking-engine";
import { buildMemeGenerationPrompt, PROMPT_VERSION, type PromptOptions } from "./prompt-builder";
import { recordGeneration } from "./generation-analytics";

export interface MemeGenerationInput {
  brandId: string;
  userId: string;
  topic: string;
  count?: number;
  campaignName?: string;
  targetAudience?: string;
  marketingGoal?: string;
  tone?: string;
  cta?: string;
  additionalNotes?: string;
}

export interface GeneratedMeme {
  id: string;
  templateId: string;
  templateTitle: string;
  templateImageUrl: string | null;
  title: string | null;
  description: string | null;
  topText: string | null;
  bottomText: string | null;
  regionCaptions: Record<string, string> | null;
  textLayout: string;
  regions?: any[] | null;
  confidence: number;
  tone: string;
  reasonSelected: string;
  hashtags: string[];
  status: string;
}

export interface MemeGenerationResult {
  generationId: string;
  memes: GeneratedMeme[];
  provider: string;
  model: string;
  generationTimeMs: number;
  tokenUsage: number;
  fallbackCount: number;
  templateCandidateCount: number;
}

/**
 * Main Meme Engine Orchestrator.
 *
 * Single entry point for all meme generation operations.
 *
 * Flow:
 * 1. Build brand context from DB
 * 2. Rank templates by relevance to brand + topic
 * 3. Build structured prompt with brand context + template metadata
 * 4. Call LLM via MemeGenerationProvider (with failover)
 * 5. Validate AI response against Zod schema
 * 6. Persist draft memes to database
 * 7. Record generation analytics
 * 8. Return structured result to API layer
 */
export async function generateMemes(
  input: MemeGenerationInput
): Promise<MemeGenerationResult> {
  const count = input.count || 4;
  const startTime = Date.now();

  // 1. Build brand context
  const brandContext = await buildBrandContext(input.brandId);

  // 2. Rank templates
  const rankedTemplates = await rankTemplates(brandContext, input.topic, 12);

  if (rankedTemplates.length === 0) {
    throw new Error(
      "No approved templates available. Upload and approve templates before generating memes."
    );
  }

  // 3. Build prompt
  const promptOptions: PromptOptions = {
    topic: input.topic,
    count: Math.min(count, rankedTemplates.length),
    campaignName: input.campaignName,
    targetAudience: input.targetAudience,
    marketingGoal: input.marketingGoal,
    tone: input.tone,
    cta: input.cta,
    additionalNotes: input.additionalNotes,
  };

  const prompt = buildMemeGenerationPrompt(brandContext, rankedTemplates, promptOptions);

  // 4. Call LLM
  const aiResponse = await MemeGenerationProvider.generate(prompt);

  // 5. Map templates for lookup
  const templateMap = new Map(
    rankedTemplates.map((t) => [t.id, t])
  );

  // 6. Persist draft memes
  const generatedMemes: GeneratedMeme[] = [];
  const { validateSafetyAndProfanity } = await import("@/lib/validations/safety-filter");
  const { ensureValidTitle, ensureValidDescription } = await import("./meme-metadata.service");

  let candidateIdx = 0;
  for (const candidate of aiResponse.result.memes) {
    const template = templateMap.get(candidate.template_id);

    let cleanTopText = candidate.top_text || null;
    let cleanBottomText = candidate.bottom_text || null;
    let cleanRegionCaptions = candidate.region_captions || null;

    if (cleanTopText && !validateSafetyAndProfanity(cleanTopText).isValid) {
      cleanTopText = "";
    }
    if (cleanBottomText && !validateSafetyAndProfanity(cleanBottomText).isValid) {
      cleanBottomText = "";
    }
    if (cleanRegionCaptions) {
      const copy = { ...cleanRegionCaptions };
      for (const [key, value] of Object.entries(copy)) {
        if (!validateSafetyAndProfanity(value).isValid) {
          copy[key] = "";
        }
      }
      cleanRegionCaptions = copy;
    }

    // Ensure valid AI title (3-8 words) and description (40-100 words) with fallback
    let cleanTitle = ensureValidTitle(candidate.title, {
      topic: input.topic,
      templateTitle: template?.title,
      index: candidateIdx,
    });

    let cleanDescription = ensureValidDescription(candidate.description, {
      topic: input.topic,
      templateTitle: template?.title,
      topText: cleanTopText,
      bottomText: cleanBottomText,
      brandName: brandContext.name,
      industry: brandContext.industry,
    });

    if (!validateSafetyAndProfanity(cleanTitle).isValid) {
      cleanTitle = ensureValidTitle(null, {
        topic: input.topic,
        templateTitle: template?.title,
        index: candidateIdx,
      });
    }

    if (!validateSafetyAndProfanity(cleanDescription).isValid) {
      cleanDescription = ensureValidDescription(null, {
        topic: input.topic,
        templateTitle: template?.title,
        topText: cleanTopText,
        bottomText: cleanBottomText,
        brandName: brandContext.name,
        industry: brandContext.industry,
      });
    }

    candidateIdx++;

    const [meme] = await db
      .insert(memes)
      .values({
        brand_id: input.brandId,
        template_id: template ? candidate.template_id : null,
        generator_id: input.userId,
        prompt: input.topic,
        generated_caption: cleanRegionCaptions 
          ? Object.entries(cleanRegionCaptions).map(([k, v]) => `${k}: ${v}`).join(" | ")
          : [cleanTopText, cleanBottomText].filter(Boolean).join(" | "),
        generated_hashtags: candidate.hashtags,
        title: cleanTitle,
        description: cleanDescription,
        top_text: cleanTopText,
        bottom_text: cleanBottomText,
        region_captions: cleanRegionCaptions,
        text_layout: candidate.text_layout,
        ai_confidence: candidate.confidence,
        ai_reasoning: candidate.reason_selected,
        ai_tone: candidate.tone,
        generation_provider: aiResponse.provider,
        generation_model: aiResponse.model,
        generation_duration_ms: aiResponse.durationMs,
        token_usage: aiResponse.tokenUsage,
        prompt_version: PROMPT_VERSION,
        status: "draft",
        retry_count: 0,
        fallback_count: aiResponse.fallbackCount,
        watermark_enabled: true,
        generation_timestamp: new Date(),
        visibility: "private",
      } as any)
      .returning();

    generatedMemes.push({
      id: meme.id,
      templateId: candidate.template_id,
      templateTitle: template?.title || "Unknown Template",
      templateImageUrl: template?.imageUrl || null,
      title: cleanTitle,
      description: cleanDescription,
      topText: cleanTopText,
      bottomText: cleanBottomText,
      regionCaptions: cleanRegionCaptions,
      textLayout: candidate.text_layout,
      regions: (template?.aiGenerationProfile as any)?.regions || null,
      confidence: candidate.confidence,
      tone: candidate.tone,
      reasonSelected: candidate.reason_selected,
      hashtags: candidate.hashtags,
      status: "draft",
    });
  }

  // 7. Record generation analytics
  const generationId = await recordGeneration(
    {
      brandId: input.brandId,
      userId: input.userId,
      topic: input.topic,
      campaignName: input.campaignName,
      targetAudience: input.targetAudience,
      marketingGoal: input.marketingGoal,
      tone: input.tone,
      cta: input.cta,
      additionalNotes: input.additionalNotes,
      memeCount: generatedMemes.length,
      promptVersion: PROMPT_VERSION,
    },
    {
      providerUsed: aiResponse.provider,
      modelUsed: aiResponse.model,
      generationTimeMs: aiResponse.durationMs,
      totalTokens: aiResponse.tokenUsage,
      status: "completed",
    }
  );

  // 8. Update memes with generation_id
  for (const gm of generatedMemes) {
    await db
      .update(memes)
      .set({ generation_id: generationId } as any)
      .where(
        require("drizzle-orm").eq(memes.id, gm.id)
      )
      .catch(() => null);
  }

  return {
    generationId,
    memes: generatedMemes,
    provider: aiResponse.provider,
    model: aiResponse.model,
    generationTimeMs: aiResponse.durationMs,
    tokenUsage: aiResponse.tokenUsage,
    fallbackCount: aiResponse.fallbackCount,
    templateCandidateCount: rankedTemplates.length,
  };
}

/**
 * Regenerate specific memes from a generation batch.
 */
export async function regenerateMemes(
  generationId: string,
  memeIds: string[],
  userId: string,
  brandId: string,
  originalTopic: string
): Promise<MemeGenerationResult> {
  // Delete the old memes being regenerated
  const { eq } = await import("drizzle-orm");
  for (const memeId of memeIds) {
    await db
      .update(memes)
      .set({ deleted_at: new Date(), updated_at: new Date() })
      .where(eq(memes.id, memeId))
      .catch(() => null);
  }

  // Generate replacements
  return generateMemes({
    brandId,
    userId,
    topic: originalTopic,
    count: memeIds.length,
  });
}

/**
 * Update meme status (draft → accepted/rejected).
 */
export async function updateMemeStatus(
  memeId: string,
  userId: string,
  status: "accepted" | "rejected"
): Promise<boolean> {
  const { eq, and } = await import("drizzle-orm");
  const meme = await db.query.memes.findFirst({
    where: and(eq(memes.id, memeId), eq(memes.generator_id, userId)),
  });

  if (!meme) return false;

  await db
    .update(memes)
    .set({ status, updated_at: new Date() } as any)
    .where(eq(memes.id, memeId));

  return true;
}
