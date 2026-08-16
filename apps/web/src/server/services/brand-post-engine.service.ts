import { brandPostRepository } from "@/server/repositories";
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

        // Validate strictly against BrandPost4VariationsOutputSchema
        const validated = BrandPost4VariationsOutputSchema.parse(response.parsedJson);
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
