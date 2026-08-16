import { ModelCapability, AIOperationType } from "../types/provider.types";

export const DEFAULT_MODEL_REGISTRY: ModelCapability[] = [
  // --- High-Speed Text & Structured Concept Generation (Mistral Priority 1) ---
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
    priority: 1, // Priority 1 as requested
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
    supportsToolCalling: true,
    latencyTier: "low",
    priority: 1, // Priority 1 for vision
    status: "active",
  },
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
    priority: 2,
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
    provider: "openrouter",
    modelId: "google/gemini-2.5-flash",
    displayName: "OpenRouter Gemini 2.5 Flash",
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

  // --- Multimodal Image Generation & Inpainting Models ---
  {
    provider: "openrouter",
    modelId: "black-forest-labs/flux.2-pro",
    displayName: "Flux 2 Pro Photorealism Engine",
    contextWindow: 4096,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsImageGeneration: true,
    supportsImageEditing: false,
    supportsStructuredOutput: false,
    supportsStreaming: false,
    supportsToolCalling: false,
    latencyTier: "standard",
    priority: 1,
    status: "active",
  },
  {
    provider: "openrouter",
    modelId: "black-forest-labs/flux-1-schnell",
    displayName: "Flux 1 Schnell",
    contextWindow: 4096,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsImageGeneration: true,
    supportsImageEditing: false,
    supportsStructuredOutput: false,
    supportsStreaming: false,
    supportsToolCalling: false,
    latencyTier: "standard",
    priority: 2,
    status: "active",
  },
  {
    provider: "openrouter",
    modelId: "recraft-ai/recraft-v3",
    displayName: "Recraft v3 Brand & Vector Engine",
    contextWindow: 4096,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsImageGeneration: true,
    supportsImageEditing: true,
    supportsStructuredOutput: false,
    supportsStreaming: false,
    supportsToolCalling: false,
    latencyTier: "standard",
    priority: 3,
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
    latencyTier: "standard",
    priority: 4,
    status: "active",
  },
  {
    provider: "openrouter",
    modelId: "black-forest-labs/flux-1.1-pro",
    displayName: "Flux 1.1 Pro Photorealism Engine",
    contextWindow: 4096,
    maxOutputTokens: 1024,
    supportsVision: false,
    supportsImageGeneration: true,
    supportsImageEditing: false,
    supportsStructuredOutput: false,
    supportsStreaming: false,
    supportsToolCalling: false,
    latencyTier: "standard",
    priority: 5,
    status: "active",
  },
];

export class ModelCapabilityRegistry {
  private models: Map<string, ModelCapability> = new Map();

  constructor(initialModels: ModelCapability[] = DEFAULT_MODEL_REGISTRY) {
    for (const m of initialModels) {
      this.registerModel(m);
    }
  }

  public registerModel(capability: ModelCapability): void {
    const key = `${capability.provider}:${capability.modelId}`;
    this.models.set(key, capability);
  }

  public getModel(provider: string, modelId: string): ModelCapability | undefined {
    return this.models.get(`${provider}:${modelId}`);
  }

  public getAllModels(): ModelCapability[] {
    return Array.from(this.models.values());
  }

  public getActiveModels(): ModelCapability[] {
    return this.getAllModels().filter((m) => m.status === "active");
  }

  public findCapableModels(query: {
    requiresVision?: boolean;
    requiresImageGeneration?: boolean;
    requiresImageEditing?: boolean;
    requiresStructuredOutput?: boolean;
    requiresToolCalling?: boolean;
    minContextWindow?: number;
    minimumContextTokens?: number;
    provider?: string;
  } = {}): ModelCapability[] {
    const minCtx = query.minContextWindow || query.minimumContextTokens;
    return this.getActiveModels()
      .filter((m) => {
        if (query.provider && m.provider !== query.provider) return false;
        if (query.requiresVision && !m.supportsVision) return false;
        if (query.requiresImageGeneration && !m.supportsImageGeneration) return false;
        if (query.requiresImageEditing && !m.supportsImageEditing) return false;
        if (query.requiresStructuredOutput && !m.supportsStructuredOutput) return false;
        if (query.requiresToolCalling && !m.supportsToolCalling) return false;
        if (minCtx && m.contextWindow < minCtx) return false;
        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  public findModelsForOperation(
    operation: AIOperationType,
    requirements: Partial<ModelCapability> = {}
  ): ModelCapability[] {
    return this.getActiveModels()
      .filter((m) => {
        if (requirements.supportsVision && !m.supportsVision) return false;
        if (requirements.supportsImageGeneration && !m.supportsImageGeneration) return false;
        if (requirements.supportsImageEditing && !m.supportsImageEditing) return false;
        if (requirements.supportsStructuredOutput && !m.supportsStructuredOutput) return false;
        if (requirements.supportsToolCalling && !m.supportsToolCalling) return false;
        if (requirements.contextWindow && m.contextWindow < requirements.contextWindow) return false;
        return true;
      })
      .sort((a, b) => a.priority - b.priority);
  }

  public updateModelStatus(provider: string, modelId: string, status: "active" | "degraded" | "disabled"): boolean {
    const model = this.getModel(provider, modelId);
    if (model) {
      model.status = status;
      return true;
    }
    return false;
  }

  public setModelStatus(provider: string, modelId: string, status: "active" | "degraded" | "disabled"): boolean {
    return this.updateModelStatus(provider, modelId, status);
  }
}

export const globalModelRegistry = new ModelCapabilityRegistry();
