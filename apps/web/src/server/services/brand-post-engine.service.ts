import * as brandPostRepository from "../repositories/brand-post.repository";
import { getBrandVisualProfile } from "./brand-visual-profile.service";
import {
  globalModelRouter,
  FallbackHandler,
  GroqAdapter,
  MistralAdapter,
  OpenRouterAdapter,
  buildBrandPostConceptSystemPrompt,
  buildBrandPostConceptUserPrompt,
  BrandPost4VariationsOutputSchema,
  BrandPost4VariationsOutput,
  BrandVisualProfile,
  AIProviderError,
} from "@virlio/ai";

export interface GeneratePostVariationsInput {
  sessionId: string;
  brandId: string;
  userId: string;
  userPrompt: string;
  campaignGoal?: string;
  targetAudience?: string;
  targetPlatform?: string;
  aspectRatio?: string;
  toneOverride?: string;
  selectedProduct?: string;
  selectedService?: string;
}

export interface GeneratePostVariationsResult {
  generationId: string;
  sessionId: string;
  brandId: string;
  campaignTheme: string;
  focusSummary: string;
  variations: any[];
  providerUsed: string;
  modelUsed: string;
  generationTimeMs: number;
  totalTokens: number;
  fallbackCount: number;
}

// Initialize fallback handler with active adapters
const fallbackHandler = new FallbackHandler(globalModelRouter);
fallbackHandler.registerAdapter(new GroqAdapter());
fallbackHandler.registerAdapter(new MistralAdapter());
fallbackHandler.registerAdapter(new OpenRouterAdapter());

/**
 * Resiliently normalizes raw LLM output into a guaranteed BrandPost4VariationsOutput structure.
 * Handles snake_case vs camelCase, nested wrappers, arrays, and missing fields.
 */
export function normalizeConceptOutput(
  raw: any,
  userPrompt: string,
  profile: BrandVisualProfile
): BrandPost4VariationsOutput {
  if (!raw || typeof raw !== "object") {
    raw = {};
  }

  // 1. Extract raw variations array from potential wrappers
  let rawList: any[] = [];
  if (Array.isArray(raw)) {
    rawList = raw;
  } else if (Array.isArray(raw.variations)) {
    rawList = raw.variations;
  } else if (Array.isArray(raw.concepts)) {
    rawList = raw.concepts;
  } else if (Array.isArray(raw.posts)) {
    rawList = raw.posts;
  } else if (raw.data && typeof raw.data === "object") {
    if (Array.isArray(raw.data.variations)) rawList = raw.data.variations;
    else if (Array.isArray(raw.data.concepts)) rawList = raw.data.concepts;
  }

  const campaignTheme =
    raw.campaign_theme ||
    raw.campaignTheme ||
    raw.theme ||
    raw.title ||
    `${profile.brandName} Social Campaign`;

  const focusSummary =
    raw.focus_summary ||
    raw.focusSummary ||
    raw.summary ||
    raw.description ||
    `4 diverged creative visual directions crafted for ${profile.brandName}.`;

  const defaultDirections: Array<"product_hero" | "lifestyle" | "editorial" | "bold_social"> = [
    "product_hero",
    "lifestyle",
    "editorial",
    "bold_social",
  ];

  const defaultLabels = [
    "Studio Product Hero",
    "In-Situ Lifestyle",
    "Minimalist Editorial",
    "Bold Social Hook",
  ];

  const normalizedVariations = defaultDirections.map((dir, idx) => {
    const item = rawList[idx] || {};

    const creativeDirection =
      item.creative_direction ||
      item.creativeDirection ||
      item.direction ||
      item.type ||
      dir;

    const directionLabel =
      item.direction_label ||
      item.directionLabel ||
      item.label ||
      defaultLabels[idx];

    const conceptTitle =
      item.concept_title ||
      item.conceptTitle ||
      item.title ||
      item.headline ||
      `${directionLabel} - ${profile.brandName}`;

    const conceptDescription =
      item.concept_description ||
      item.conceptDescription ||
      item.description ||
      `Creative concept executing the ${directionLabel} angle for ${profile.brandName}.`;

    const visualSceneDescription =
      item.visual_scene_description ||
      item.visualSceneDescription ||
      item.visual_description ||
      item.scene ||
      `Studio commercial photography with solid background in ${profile.colors.primary}, clean lighting, high detail.`;

    const diffusionPrompt =
      item.diffusion_prompt ||
      item.diffusionPrompt ||
      item.prompt ||
      `Commercial high-resolution branded post photography, solid ${profile.colors.primary} and ${profile.colors.darkBackground} backdrop, crisp studio rim light, 8k resolution, elegant composition.`;

    const negativePrompt =
      item.negative_prompt ||
      item.negativePrompt ||
      "gradients, blurry, low resolution, distorted text, cluttered";

    const headlineText =
      item.headline_text ||
      item.headlineText ||
      item.headline ||
      conceptTitle;

    const bodyCopy =
      item.body_copy ||
      item.bodyCopy ||
      item.body ||
      item.copy ||
      null;

    const captionCopy =
      item.caption_copy ||
      item.captionCopy ||
      item.caption ||
      `${conceptTitle}. Discover more with ${profile.brandName}.`;

    const hashtags = Array.isArray(item.hashtags)
      ? item.hashtags
      : [`#${profile.brandName.replace(/\s+/g, "")}`, "#BrandedContent"];

    const suggestedLayout = (item.suggested_layout ||
      item.suggestedLayout ||
      item.layout ||
      "center_hero") as any;

    const colorAccentsUsed = Array.isArray(item.color_accents_used || item.colorAccentsUsed)
      ? (item.color_accents_used || item.colorAccentsUsed)
      : [profile.colors.primary, profile.colors.accent];

    return {
      variation_index: idx + 1,
      creative_direction: dir,
      direction_label: directionLabel,
      concept_title: conceptTitle,
      concept_description: conceptDescription,
      visual_scene_description: visualSceneDescription,
      diffusion_prompt: diffusionPrompt,
      negative_prompt: negativePrompt,
      headline_text: headlineText,
      body_copy: bodyCopy,
      caption_copy: captionCopy,
      hashtags,
      suggested_layout: ["center_hero", "split_left_text", "split_right_text", "minimal_bottom_text", "clean_visual_only"].includes(suggestedLayout)
        ? suggestedLayout
        : "center_hero",
      color_accents_used: colorAccentsUsed,
    };
  });

  const structured = {
    campaign_theme: campaignTheme,
    focus_summary: focusSummary,
    variations: normalizedVariations,
  };

  return BrandPost4VariationsOutputSchema.parse(structured);
}

export async function generatePostVariations(
  input: GeneratePostVariationsInput
): Promise<GeneratePostVariationsResult> {
  const startTime = Date.now();

  // 1. Fetch normalized Brand Visual Profile
  const visualProfile = await getBrandVisualProfile(input.brandId);

  // 2. Build structured system and user prompts
  const systemPrompt = buildBrandPostConceptSystemPrompt();
  const userPrompt = buildBrandPostConceptUserPrompt(visualProfile, {
    userPrompt: input.userPrompt,
    campaignGoal: input.campaignGoal,
    targetAudience: input.targetAudience,
    targetPlatform: input.targetPlatform,
    aspectRatio: input.aspectRatio,
    toneOverride: input.toneOverride,
    selectedProduct: input.selectedProduct,
    selectedService: input.selectedService,
  });

  // 3. Create initial Generation record in 'processing' status
  const generation = await brandPostRepository.createGeneration({
    session_id: input.sessionId,
    brand_id: input.brandId,
    user_id: input.userId,
    user_prompt: input.userPrompt,
    campaign_goal: input.campaignGoal || null,
    target_audience: input.targetAudience || null,
    tone_override: input.toneOverride || null,
    status: "processing",
  });

  if (!generation) {
    throw new Error("Failed to initialize brand post generation record");
  }

  try {
    // 4. Call AI Orchestrator across compatible fallback chain
    const execution = await fallbackHandler.executeWithFallback(
      {
        operation: "CONCEPT_IDEATION",
        requiredCapabilities: { requiresStructuredOutput: true },
      },
      async (adapter, model) => {
        const response = await adapter.generateText(model.modelId, {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.7,
          responseFormat: { type: "json_object" },
        });

        if (!response.parsedJson) {
          throw new AIProviderError(
            "Provider response did not contain parsed JSON",
            adapter.providerName,
            model.modelId,
            "MALFORMED_OUTPUT"
          );
        }

        // Resiliently normalize and validate output
        const validated = normalizeConceptOutput(
          response.parsedJson,
          input.userPrompt,
          visualProfile
        );

        return {
          validated,
          tokenUsage: response.tokenUsage,
        };
      }
    );

    const { validated, tokenUsage } = execution.result;
    const latencyMs = Date.now() - startTime;

    // 5. Persist the 4 distinct variations in database
    const variationsToCreate = validated.variations.map((v) => ({
      generation_id: generation.id,
      session_id: input.sessionId,
      brand_id: input.brandId,
      variation_index: v.variation_index,
      creative_direction: v.creative_direction,
      concept_title: v.concept_title,
      concept_description: `${v.direction_label}: ${v.concept_description}`,
      headline_text: v.headline_text || null,
      body_copy: v.body_copy || null,
      caption_copy: v.caption_copy || null,
      hashtags: v.hashtags || [],
      is_selected: v.variation_index === 1, // Default select first variation
      is_approved: false,
    }));

    const createdVariations = await brandPostRepository.createVariationsBatch(variationsToCreate);

    // 6. Update generation record status to 'completed'
    await brandPostRepository.updateGenerationStatus(generation.id, "completed", {
      providerUsed: execution.provider,
      modelUsed: execution.model,
      generationTimeMs: latencyMs,
      totalTokens: tokenUsage.totalTokens,
    });

    return {
      generationId: generation.id,
      sessionId: input.sessionId,
      brandId: input.brandId,
      campaignTheme: validated.campaign_theme,
      focusSummary: validated.focus_summary,
      variations: createdVariations,
      providerUsed: execution.provider,
      modelUsed: execution.model,
      generationTimeMs: latencyMs,
      totalTokens: tokenUsage.totalTokens,
      fallbackCount: execution.fallbackCount,
    };
  } catch (err: any) {
    const errorMsg = err.message || "Failed to generate brand post variations";
    await brandPostRepository.updateGenerationStatus(generation.id, "failed", {
      errorMessage: errorMsg,
      generationTimeMs: Date.now() - startTime,
    });
    throw err;
  }
}
