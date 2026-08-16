import * as brandRepository from "../repositories/brand.repository";
import * as brandPostRepository from "../repositories/brand-post.repository";
import {
  globalConversationMemory,
  globalModelRegistry,
  BrandMemoryPayload,
  SessionMemoryPayload,
  ImageVersionMetadata,
  GenerationHistoryTurn,
  WorkingContextPayload,
  AllocatedContextResult,
} from "@virlio/ai";

export interface BuildWorkingContextParams {
  sessionId: string;
  targetModelId?: string;
  targetProvider?: string;
  currentInstruction: string;
  activeVersionId?: string;
  selectedCreativeDirection?: string;
}

export interface WorkingContextResult {
  contextString: string;
  allocation: AllocatedContextResult;
  brand: any;
  session: any;
  activeVersion?: ImageVersionMetadata | null;
  lineage?: any[];
}

/**
 * Builds the hydrated, token-budgeted working context for an AI generation or edit request.
 */
export async function buildWorkingContext(
  params: BuildWorkingContextParams
): Promise<WorkingContextResult> {
  const session = await brandPostRepository.findSessionWithDetails(params.sessionId);
  if (!session) {
    throw new Error(`Generation session not found: ${params.sessionId}`);
  }

  const brand = await brandRepository.findById(session.brand_id);
  if (!brand) {
    throw new Error(`Brand not found for session: ${session.brand_id}`);
  }

  const kb = await brandRepository.getKnowledgeBase(brand.id);
  const kbData = kb || ({} as any);

  // 1. Extract Brand Memory
  const colors = (kbData.identity?.colors as any) || {
    primary: "#2563EB",
    secondary: "#1E40AF",
    accent: "#F59E0B",
    darkBackground: "#0F172A",
    lightBackground: "#F8FAFC",
  };

  const brandMemory: BrandMemoryPayload = {
    brandId: brand.id,
    brandName: brand.name,
    industry: brand.industry || "General",
    colors: {
      primary: colors.primary || "#2563EB",
      secondary: colors.secondary || "#1E40AF",
      accent: colors.accent || "#F59E0B",
      darkBackground: colors.darkBackground || "#0F172A",
      lightBackground: colors.lightBackground || "#F8FAFC",
    },
    typography: {
      fontFamily: kbData.identity?.typography?.fontFamily || "Inter",
      style: kbData.identity?.typography?.style || "Modern Sans",
    },
    logoRule: brand.logo_url
      ? "Place official brand logo in top-left or top-right with clear margin"
      : "No logo asset provided; integrate brand name cleanly into typography",
    prohibitedStyles: Array.isArray(kbData.restrictions?.styles_avoid)
      ? kbData.restrictions.styles_avoid
      : ["gradients", "blurry rendering", "cluttered collage", "neon glow"],
    prohibitedColors: Array.isArray(kbData.restrictions?.colors_avoid)
      ? kbData.restrictions.colors_avoid
      : [],
    personality: Array.isArray(kbData.identity?.personality)
      ? kbData.identity.personality
      : ["Modern", "Professional", "Crisp"],
    toneOfVoice: kbData.brand_voice?.tone || "Friendly & Informative",
    products: Array.isArray(kbData.products_services?.products)
      ? kbData.products_services.products
      : [],
    services: Array.isArray(kbData.products_services?.services)
      ? kbData.products_services.services
      : [],
    usps: Array.isArray(kbData.products_services?.usps)
      ? kbData.products_services.usps
      : [],
    targetAudience: Array.isArray(kbData.audience?.target_age_groups)
      ? `${kbData.audience.target_age_groups.join(", ")} interested in ${(kbData.audience.audience_interests || []).join(", ")}`
      : undefined,
  };

  // 2. Extract Session Memory
  const sessionMemory: SessionMemoryPayload = {
    sessionId: session.id,
    brandId: session.brand_id,
    title: session.title,
    focusType: (session.focus_type as any) || "general",
    targetPlatform: session.target_platform,
    aspectRatio: session.aspect_ratio,
    selectedProduct: session.selected_product || undefined,
    selectedService: session.selected_service || undefined,
  };

  // 3. Resolve Active Image Version & Parent Lineage
  let activeVersionMeta: ImageVersionMetadata | null = null;
  let recentEdits: Array<{ versionNumber: number; editInstruction: string }> = [];
  let lineage: any[] = [];

  if (params.activeVersionId) {
    lineage = await brandPostRepository.findImageVersionLineage(params.activeVersionId);
    const activeNode = lineage[lineage.length - 1];

    if (activeNode) {
      activeVersionMeta = {
        versionId: activeNode.id,
        versionNumber: activeNode.version_number,
        parentVersionId: activeNode.parent_version_id,
        editInstruction: activeNode.edit_instruction,
        fullPrompt: activeNode.full_generation_prompt,
        seed: activeNode.seed,
        aspectRatio: activeNode.aspect_ratio,
        imageUrl: activeNode.image_url,
        provider: activeNode.provider,
        model: activeNode.model,
      };

      recentEdits = lineage
        .filter((n) => Boolean(n.edit_instruction))
        .map((n) => ({
          versionNumber: n.version_number,
          editInstruction: n.edit_instruction!,
        }))
        .slice(-3); // Keep up to 3 most recent edits
    }
  }

  // 4. Summarize Previous Generations
  const generationHistory: GenerationHistoryTurn[] = (session.generations || [])
    .slice(0, 5)
    .map((g: any) => ({
      generationId: g.id,
      userPrompt: g.user_prompt,
      createdAt: g.created_at,
      variationsSummary: (g.variations || []).map((v: any) => ({
        variationIndex: v.variation_index,
        creativeDirection: v.creative_direction,
        headline: v.headline_text,
      })),
    }));

  // 5. Look up Target Model Context Window
  let modelContextWindow = 128000;
  if (params.targetModelId) {
    const matched = globalModelRegistry.getAllModels().find(
      (m) => m.modelId.toLowerCase() === params.targetModelId?.toLowerCase()
    );
    if (matched) {
      modelContextWindow = matched.contextWindow;
    }
  }

  // 6. Assemble Working Context Payload & Allocate Tokens
  const payload: WorkingContextPayload = {
    currentUserInstruction: params.currentInstruction,
    activeImageVersion: activeVersionMeta,
    brandMemory,
    sessionMemory,
    selectedCreativeDirection: params.selectedCreativeDirection,
    recentEditHistory: recentEdits,
    generationHistory,
  };

  const { contextString, allocation } = globalConversationMemory.buildPromptContext(
    payload,
    modelContextWindow
  );

  return {
    contextString,
    allocation,
    brand,
    session,
    activeVersion: activeVersionMeta,
    lineage,
  };
}

export async function recordSessionMemory(
  sessionId: string,
  brandId: string,
  memoryType: string,
  key: string,
  content: string,
  structuredData?: any,
  importanceScore: number = 5
) {
  return brandPostRepository.upsertMemory(sessionId, brandId, key, {
    memoryType,
    content,
    structuredData,
    importanceScore,
  });
}

export async function getSessionMemories(sessionId: string) {
  return brandPostRepository.findMemoriesBySession(sessionId);
}

export async function deleteSessionMemory(id: string) {
  return brandPostRepository.deleteMemory(id);
}
