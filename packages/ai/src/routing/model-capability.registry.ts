import { ModelCapability, AIOperationType } from "../types/provider.types";

export const DEFAULT_MODEL_REGISTRY: ModelCapability[] = [
  // --- High-Speed Text & Structured Concept Generation ---
  {
    provider: "groq",
    modelId: "llama-3.3-70b-versatile",
    displayName: "Groq Llama 3.3 70B Versatile",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsImageGeneration: false,
    supportsImageEditing: false,
    supportsStructuredOutput: true,
    supportsStreaming: true,
    supportsToolCalling: true,
    latencyTier: "ultra-low",
    priority: 1,
    status: "active",
  },
  {
    provider: "groq",
    modelId: "llama-3.2-11b-vision",
    displayName: "Groq Llama 3.2 11B Vision",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsImageGeneration: false,
    supportsImageEditing: false,
    supportsStructuredOutput: true,
    supportsStreaming: true,
    supportsToolCalling: true,
    latencyTier: "ultra-low",
    priority: 2,
    status: "active",
  },
  {
    provider: "mistral",
    modelId: "mistral-large-latest",
    displayName: "Mistral Large",
    contextWindow: 128000,
    maxOutputTokens: 8192,
    supportsVision: false,
    supportsImageGeneration: false,
    supportsImageEditing: false,
    supportsStructuredOutput: true,
    supportsStreaming: true,
    supportsToolCalling: true,
    latencyTier: "low",
    priority: 2,
    status: "active",
  },
  {
    provider: "mistral",
    modelId: "pixtral-12b-2409",
    displayName: "Pixtral 12B Vision Analysis",
    contextWindow: 128000,
    maxOutputTokens: 4096,
    supportsVision: true,
    supportsImageGeneration: false,
    supportsImageEditing: false,
    supportsStructuredOutput: true,
    supportsStreaming: true,
    supportsToolCalling: false,
    latencyTier: "low",
    priority: 1,
    status: "active",
  },
  {
    provider: "openrouter",
    modelId: "google/gemini-2.5-flash",
    displayName: "Gemini 2.5 Flash via OpenRouter",
    contextWindow: 1000000,
    maxOutputTokens: 8192,
    supportsVision: true,
    supportsImageGeneration: false,
    supportsImageEditing: false,
    supportsStructuredOutput: true,
    supportsStreaming: true,
    supportsToolCalling: true,
    latencyTier: "low",
    priority: 3,
    status: "active",
  },

  // --- Image Generation & Editing Models ---
  {
    provider: "openrouter",
    modelId: "black-forest-labs/flux-1.1-pro",
    displayName: "Flux 1.1 Pro",
    contextWindow: 4096,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsImageGeneration: true,
    supportsImageEditing: false,
    supportsStructuredOutput: false,
    supportsStreaming: false,
    supportsToolCalling: false,
    supportedAspectRatios: ["1:1", "4:5", "9:16", "16:9"],
    latencyTier: "standard",
    priority: 1,
    status: "active",
  },
  {
    provider: "openrouter",
    modelId: "recraft-ai/recraft-v3",
    displayName: "Recraft v3 Brand & Vector",
    contextWindow: 4096,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsImageGeneration: true,
    supportsImageEditing: true, // Native inpainting / image editing support
    supportsStructuredOutput: false,
    supportsStreaming: false,
    supportsToolCalling: false,
    supportedAspectRatios: ["1:1", "4:5", "9:16", "16:9"],
    latencyTier: "standard",
    priority: 1,
    status: "active",
  },
  {
    provider: "openrouter",
    modelId: "google/imagen-3",
    displayName: "Google Imagen 3",
    contextWindow: 4096,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsImageGeneration: true,
    supportsImageEditing: true,
    supportsStructuredOutput: false,
    supportsStreaming: false,
    supportsToolCalling: false,
    supportedAspectRatios: ["1:1", "4:5", "9:16", "16:9"],
    latencyTier: "standard",
    priority: 2,
    status: "active",
  },
];

export class ModelCapabilityRegistry {
  private registry: Map<string, ModelCapability> = new Map();

  constructor(initialModels: ModelCapability[] = DEFAULT_MODEL_REGISTRY) {
    for (const model of initialModels) {
      this.registerModel(model);
    }
  }

  public registerModel(model: ModelCapability): void {
    const key = this.getKey(model.provider, model.modelId);
    this.registry.set(key, { ...model });
  }

  public getModel(provider: string, modelId: string): ModelCapability | null {
    const key = this.getKey(provider, modelId);
    return this.registry.get(key) || null;
  }

  public getAllModels(): ModelCapability[] {
    return Array.from(this.registry.values());
  }

  public updateModelStatus(provider: string, modelId: string, status: "active" | "degraded" | "disabled"): boolean {
    const key = this.getKey(provider, modelId);
    const existing = this.registry.get(key);
    if (!existing) return false;
    this.registry.set(key, { ...existing, status });
    return true;
  }

  public findCapableModels(criteria: {
    requiresVision?: boolean;
    requiresImageGeneration?: boolean;
    requiresImageEditing?: boolean;
    requiresStructuredOutput?: boolean;
    minimumContextTokens?: number;
    provider?: string;
  }): ModelCapability[] {
    return Array.from(this.registry.values()).filter((model) => {
      if (model.status === "disabled") return false;
      if (criteria.provider && model.provider !== criteria.provider) return false;
      if (criteria.requiresVision && !model.supportsVision) return false;
      if (criteria.requiresImageGeneration && !model.supportsImageGeneration) return false;
      if (criteria.requiresImageEditing && !model.supportsImageEditing) return false;
      if (criteria.requiresStructuredOutput && !model.supportsStructuredOutput) return false;
      if (criteria.minimumContextTokens && model.contextWindow < criteria.minimumContextTokens) return false;
      return true;
    });
  }

  private getKey(provider: string, modelId: string): string {
    return `${provider.toLowerCase()}::${modelId.toLowerCase()}`;
  }
}

export const globalModelRegistry = new ModelCapabilityRegistry();
