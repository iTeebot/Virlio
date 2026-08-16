import {
  MemoryPriority,
  MemoryItem,
  ContextWindowManager,
  globalContextWindowManager,
  estimateTokens,
  AllocatedContextResult,
} from "./context-window.manager";

export interface BrandMemoryPayload {
  brandId: string;
  brandName: string;
  industry: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    darkBackground: string;
    lightBackground: string;
  };
  typography: {
    fontFamily: string;
    style: string;
  };
  logoRule: string;
  prohibitedStyles: string[];
  prohibitedColors: string[];
  personality: string[];
  toneOfVoice: string;
  products?: string[];
  services?: string[];
  usps?: string[];
  targetAudience?: string;
}

export interface SessionMemoryPayload {
  sessionId: string;
  brandId: string;
  title: string;
  focusType: "product" | "service" | "general" | "campaign";
  targetPlatform: string;
  aspectRatio: string;
  selectedProduct?: string;
  selectedService?: string;
  creativeDecisions?: Array<{ key: string; decision: string }>;
}

export interface ImageVersionMetadata {
  versionId: string;
  versionNumber: number;
  parentVersionId?: string | null;
  editInstruction?: string | null;
  fullPrompt: string;
  seed?: number | null;
  aspectRatio: string;
  imageUrl: string;
  provider: string;
  model: string;
}

export interface GenerationHistoryTurn {
  generationId: string;
  userPrompt: string;
  createdAt: Date | string;
  variationsSummary: Array<{
    variationIndex: number;
    creativeDirection: string;
    headline?: string | null;
  }>;
}

export interface WorkingContextPayload {
  currentUserInstruction: string;
  activeImageVersion?: ImageVersionMetadata | null;
  brandMemory: BrandMemoryPayload;
  sessionMemory: SessionMemoryPayload;
  selectedCreativeDirection?: string;
  recentEditHistory?: Array<{ versionNumber: number; editInstruction: string }>;
  generationHistory?: GenerationHistoryTurn[];
}

export class LayeredConversationMemory {
  constructor(private contextManager: ContextWindowManager = globalContextWindowManager) {}

  /**
   * Transforms raw layered payloads into prioritized MemoryItem structures.
   */
  public createMemoryItems(payload: WorkingContextPayload): MemoryItem[] {
    const items: MemoryItem[] = [];

    // P1: Current User Instruction / Edit Command (Mandatory)
    items.push({
      id: "p1-user-instruction",
      priority: MemoryPriority.P1_CURRENT_USER_INSTRUCTION,
      category: "user_instruction",
      content: `[CURRENT INSTRUCTION]: "${payload.currentUserInstruction}"`,
      isCompressible: false,
    });

    // P2: Selected Image Version & Technical Metadata (Mandatory if present)
    if (payload.activeImageVersion) {
      const v = payload.activeImageVersion;
      items.push({
        id: "p2-active-version",
        priority: MemoryPriority.P2_CURRENT_IMAGE_VERSION,
        category: "active_image_version",
        content: `[ACTIVE IMAGE VERSION]: Version ${v.versionNumber} (ID: ${v.versionId}). Aspect Ratio: ${v.aspectRatio}. Seed: ${v.seed || "random"}. Source Prompt: "${v.fullPrompt}". ${v.editInstruction ? `Previous Edit: "${v.editInstruction}".` : ""}`,
        isCompressible: false,
      });
    }

    // P3: Brand Visual Profile & Prohibited Style Rules (Mandatory)
    const brand = payload.brandMemory;
    const coreBrandText = `[BRAND VISUAL PROFILE]:
- Brand: "${brand.brandName}" (${brand.industry})
- Palette: Primary ${brand.colors.primary}, Secondary ${brand.colors.secondary}, Accent ${brand.colors.accent}, DarkBg ${brand.colors.darkBackground}, LightBg ${brand.colors.lightBackground} (CRISP SOLID COLORS ONLY - NO GRADIENTS)
- Typography: Font "${brand.typography.fontFamily}" (${brand.typography.style})
- Logo Rule: ${brand.logoRule}
- Prohibited Styles: ${brand.prohibitedStyles.join(", ")}
- Prohibited Colors: ${brand.prohibitedColors.join(", ")}`;

    const compressedBrandText = `[BRAND]: "${brand.brandName}" | Colors: ${brand.colors.primary}, ${brand.colors.secondary}, ${brand.colors.accent} | Font: ${brand.typography.fontFamily} | Tone: ${brand.toneOfVoice} | NO GRADIENTS`;

    items.push({
      id: "p3-brand-visual-profile",
      priority: MemoryPriority.P3_BRAND_VISUAL_PROFILE,
      category: "brand_visual_profile",
      content: coreBrandText,
      isCompressible: true,
      compressedContent: compressedBrandText,
    });

    // P4: Selected Creative Direction / Campaign Scope
    if (payload.selectedCreativeDirection) {
      items.push({
        id: "p4-creative-direction",
        priority: MemoryPriority.P4_CREATIVE_DIRECTION,
        category: "creative_direction",
        content: `[CREATIVE DIRECTION]: ${payload.selectedCreativeDirection}. Focus Type: ${payload.sessionMemory.focusType}. Target Platform: ${payload.sessionMemory.targetPlatform} (${payload.sessionMemory.aspectRatio}).`,
        isCompressible: false,
      });
    }

    // P5: Recent Edit History (Last 2-3 Turns)
    if (payload.recentEditHistory && payload.recentEditHistory.length > 0) {
      const editHistoryText = payload.recentEditHistory
        .map((e) => `• Version ${e.versionNumber}: "${e.editInstruction}"`)
        .join("\n");

      items.push({
        id: "p5-recent-edits",
        priority: MemoryPriority.P5_RECENT_EDIT_HISTORY,
        category: "edit_history",
        content: `[RECENT REVISION LINEAGE]:\n${editHistoryText}`,
        isCompressible: true,
        compressedContent: `[RECENT REVISIONS]: ${payload.recentEditHistory.map((e) => `v${e.versionNumber} ("${e.editInstruction}")`).join(" -> ")}`,
      });
    }

    // P6: Brand Knowledge Base Background (Audience, Products/Services, USPs)
    const kbLines: string[] = [];
    if (brand.products && brand.products.length > 0) kbLines.push(`- Products: ${brand.products.slice(0, 10).join(", ")}`);
    if (brand.services && brand.services.length > 0) kbLines.push(`- Services: ${brand.services.slice(0, 10).join(", ")}`);
    if (brand.usps && brand.usps.length > 0) kbLines.push(`- Key USPs: ${brand.usps.slice(0, 5).join(", ")}`);
    if (brand.targetAudience) kbLines.push(`- Target Audience: ${brand.targetAudience}`);

    if (kbLines.length > 0) {
      items.push({
        id: "p6-brand-kb",
        priority: MemoryPriority.P6_BRAND_KNOWLEDGE_BASE,
        category: "brand_kb",
        content: `[BRAND CONTEXT & CATALOG]:\n${kbLines.join("\n")}`,
        isCompressible: true,
        compressedContent: `[CATALOG]: ${brand.products?.slice(0, 5).join(", ") || brand.services?.slice(0, 5).join(", ") || "General"} | Audience: ${brand.targetAudience || "General"}`,
      });
    }

    // P7: Older Session History (Previous Generation Turns)
    if (payload.generationHistory && payload.generationHistory.length > 0) {
      const historyText = payload.generationHistory
        .map(
          (g, idx) =>
            `Batch ${idx + 1}: Prompt: "${g.userPrompt}" -> Concepts: [${g.variationsSummary.map((v) => `${v.creativeDirection} (${v.headline || "Concept"})`).join(", ")}]`
        )
        .join("\n");

      items.push({
        id: "p7-generation-history",
        priority: MemoryPriority.P7_OLDER_SESSION_HISTORY,
        category: "generation_history",
        content: `[PREVIOUS GENERATION BATCHES IN THIS SESSION]:\n${historyText}`,
        isCompressible: true,
        compressedContent: `[PRIOR BATCHES]: ${payload.generationHistory.length} previous generation rounds completed.`,
      });
    }

    return items;
  }

  /**
   * Compiles the prioritized memory items into a formatted system prompt context string
   * sized strictly to the target model's context window budget.
   */
  public buildPromptContext(
    payload: WorkingContextPayload,
    modelContextWindow: number
  ): { contextString: string; allocation: AllocatedContextResult } {
    const memoryItems = this.createMemoryItems(payload);
    const budget = this.contextManager.calculateBudget(modelContextWindow);
    const allocation = this.contextManager.allocateContext(memoryItems, budget);

    const contextString = allocation.retainedItems.map((item) => item.content).join("\n\n");

    return {
      contextString,
      allocation,
    };
  }
}

export const globalConversationMemory = new LayeredConversationMemory();
