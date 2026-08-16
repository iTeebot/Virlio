/**
 * Unified AI Provider & Model Capabilities Type Definitions
 */

export type AIOperationType =
  | "CONCEPT_IDEATION"       // Generate 4 distinct creative directions
  | "PROMPT_SYNTHESIS"       // Build photorealistic / graphic generation prompts
  | "IMAGE_GENERATION"       // Text-to-image synthesis
  | "IMAGE_EDITING"          // Image-to-image / inpainting / instruction editing
  | "IMAGE_VARIATION"        // Creative variation on existing visual
  | "VISION_CRITIQUE"        // Brand visual consistency validation
  | "TEXT_COMPLETION";       // General structured copy / hashtags

export interface ModelCapability {
  provider: "groq" | "mistral" | "openrouter" | "openai" | "google" | "fal" | "replicate";
  modelId: string;
  displayName: string;
  contextWindow: number;        // in tokens (e.g. 8192, 32768, 128000, 1000000)
  maxOutputTokens: number;      // max output generation tokens
  supportsVision: boolean;
  supportsImageGeneration: boolean;
  supportsImageEditing: boolean;
  supportsStructuredOutput: boolean; // JSON Schema enforcement
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportedAspectRatios?: Array<"1:1" | "4:5" | "9:16" | "16:9">;
  costPer1kInputTokens?: number;
  costPer1kOutputTokens?: number;
  costPerImageGenerated?: number;
  latencyTier: "ultra-low" | "low" | "standard" | "high";
  priority: number;             // Lower number = higher priority
  status: "active" | "degraded" | "disabled";
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: "text" | "image_url"; text?: string; image_url?: { url: string } }>;
}

export interface TextGenerationOptions {
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object"; schema?: Record<string, any> };
  abortSignal?: AbortSignal;
}

export interface TextGenerationResult {
  content: string;
  parsedJson?: any;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
  provider: string;
  model: string;
  rawResponse?: any;
}

export interface ImageGenerationOptions {
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9";
  seed?: number;
  referenceImageUrls?: string[];
  referenceStrength?: number;
  brandColors?: string[];
  stylePreset?: string;
  quality?: "standard" | "hd";
  abortSignal?: AbortSignal;
}

export interface ImageGenerationResult {
  imageBuffer: Buffer;
  format: "png" | "jpeg" | "webp";
  width: number;
  height: number;
  revisedPrompt?: string;
  seed?: number;
  latencyMs: number;
  provider: string;
  model: string;
}

export interface ImageEditingOptions {
  sourceImageUrl: string;
  maskImageUrl?: string;
  editInstruction: string;
  preservedElements: string[];
  negativePrompt?: string;
  aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9";
  strength?: number;
  abortSignal?: AbortSignal;
}

export interface ImageEditingResult {
  imageBuffer: Buffer;
  format: "png" | "jpeg" | "webp";
  width: number;
  height: number;
  revisedPrompt?: string;
  latencyMs: number;
  provider: string;
  model: string;
}

export interface AIProviderAdapter {
  readonly providerName: string;
  getCapabilities(): ModelCapability[];
  isHealthy(): Promise<boolean>;
  generateText(modelId: string, options: TextGenerationOptions): Promise<TextGenerationResult>;
  generateImage(modelId: string, options: ImageGenerationOptions): Promise<ImageGenerationResult>;
  editImage(modelId: string, options: ImageEditingOptions): Promise<ImageEditingResult>;
}

export class AIProviderError extends Error {
  constructor(
    message: string,
    public readonly provider: string,
    public readonly model: string,
    public readonly code:
      | "AUTHENTICATION_ERROR"
      | "RATE_LIMIT_EXCEEDED"
      | "CONTEXT_OVERFLOW"
      | "INCOMPATIBLE_CAPABILITY"
      | "IMAGE_GENERATION_FAILED"
      | "IMAGE_EDITING_FAILED"
      | "NETWORK_TIMEOUT"
      | "MALFORMED_OUTPUT"
      | "UNKNOWN",
    public readonly retryable: boolean = false,
    public readonly originalError?: any
  ) {
    super(`[${provider}:${model}] ${code}: ${message}`);
    this.name = "AIProviderError";
  }
}
