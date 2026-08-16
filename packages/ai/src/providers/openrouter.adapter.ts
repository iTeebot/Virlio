import {
  AIProviderAdapter,
  ModelCapability,
  TextGenerationOptions,
  TextGenerationResult,
  ImageGenerationOptions,
  ImageGenerationResult,
  ImageEditingOptions,
  ImageEditingResult,
  AIProviderError,
} from "../types/provider.types";
import { DEFAULT_MODEL_REGISTRY } from "../routing/model-capability.registry";

export class OpenRouterAdapter implements AIProviderAdapter {
  public readonly providerName = "openrouter";

  constructor(private apiKey: string = process.env.OPENROUTER_API_KEY || "") {}

  public getCapabilities(): ModelCapability[] {
    return DEFAULT_MODEL_REGISTRY.filter((m) => m.provider === "openrouter");
  }

  public async isHealthy(): Promise<boolean> {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  public async generateText(
    modelId: string,
    options: TextGenerationOptions
  ): Promise<TextGenerationResult> {
    if (!this.apiKey) {
      throw new AIProviderError(
        "OPENROUTER_API_KEY is not configured",
        "openrouter",
        modelId,
        "AUTHENTICATION_ERROR",
        false
      );
    }

    const startTime = Date.now();
    const payload: Record<string, any> = {
      model: modelId,
      messages: options.messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 4096,
    };

    if (options.responseFormat?.type === "json_object") {
      payload.response_format = { type: "json_object" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://virlio.com",
          "X-Title": "Virlio Brand Studio",
        },
        body: JSON.stringify(payload),
        signal: options.abortSignal || controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        const isRateLimit = res.status === 429;
        throw new AIProviderError(
          `OpenRouter API returned HTTP ${res.status}: ${errorText.slice(0, 300)}`,
          "openrouter",
          modelId,
          isRateLimit ? "RATE_LIMIT_EXCEEDED" : "UNKNOWN",
          isRateLimit
        );
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      const latencyMs = Date.now() - startTime;

      let parsedJson: any = undefined;
      if (options.responseFormat?.type === "json_object") {
        try {
          parsedJson = this.extractJson(content);
        } catch (e: any) {
          throw new AIProviderError(
            `Failed to parse structured JSON from OpenRouter: ${e.message}`,
            "openrouter",
            modelId,
            "MALFORMED_OUTPUT",
            false
          );
        }
      }

      return {
        content,
        parsedJson,
        tokenUsage: {
          inputTokens: data.usage?.prompt_tokens || 0,
          outputTokens: data.usage?.completion_tokens || 0,
          totalTokens: data.usage?.total_tokens || 0,
        },
        latencyMs,
        provider: "openrouter",
        model: modelId,
        rawResponse: data,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      if (err.name === "AbortError") {
        throw new AIProviderError("Request timed out", "openrouter", modelId, "NETWORK_TIMEOUT", true);
      }
      throw new AIProviderError(err.message, "openrouter", modelId, "UNKNOWN", false, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  public async generateImage(
    modelId: string,
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    if (!this.apiKey) {
      throw new AIProviderError(
        "OPENROUTER_API_KEY is not configured",
        "openrouter",
        modelId,
        "AUTHENTICATION_ERROR",
        false
      );
    }

    const startTime = Date.now();
    const payload: Record<string, any> = {
      model: modelId,
      prompt: options.prompt,
      negative_prompt: options.negativePrompt,
      aspect_ratio: options.aspectRatio || "1:1",
      seed: options.seed,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://virlio.com",
          "X-Title": "Virlio Brand Studio",
        },
        body: JSON.stringify(payload),
        signal: options.abortSignal || controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new AIProviderError(
          `OpenRouter Image Generation returned HTTP ${res.status}: ${errorText.slice(0, 300)}`,
          "openrouter",
          modelId,
          "IMAGE_GENERATION_FAILED",
          res.status === 429 || res.status >= 500
        );
      }

      const data = await res.json();
      const imageItem = data.data?.[0];
      let imageBuffer: Buffer;

      if (imageItem?.b64_json) {
        imageBuffer = Buffer.from(imageItem.b64_json, "base64");
      } else if (imageItem?.url) {
        const imgFetch = await fetch(imageItem.url);
        const arrayBuf = await imgFetch.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      } else {
        throw new AIProviderError(
          "OpenRouter response did not contain image data or URL",
          "openrouter",
          modelId,
          "IMAGE_GENERATION_FAILED"
        );
      }

      return {
        imageBuffer,
        format: "png",
        width: 1024,
        height: 1024,
        revisedPrompt: imageItem.revised_prompt,
        seed: options.seed,
        latencyMs: Date.now() - startTime,
        provider: "openrouter",
        model: modelId,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      if (err.name === "AbortError") {
        throw new AIProviderError("Image generation timed out", "openrouter", modelId, "NETWORK_TIMEOUT", true);
      }
      throw new AIProviderError(err.message, "openrouter", modelId, "IMAGE_GENERATION_FAILED", false, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  public async editImage(
    modelId: string,
    options: ImageEditingOptions
  ): Promise<ImageEditingResult> {
    if (!this.apiKey) {
      throw new AIProviderError(
        "OPENROUTER_API_KEY is not configured",
        "openrouter",
        modelId,
        "AUTHENTICATION_ERROR",
        false
      );
    }

    const startTime = Date.now();
    const editPrompt = `[IMAGE EDIT INSTRUCTION]: ${options.editInstruction}. [PRESERVE ELEMENTS]: ${options.preservedElements.join(", ")}.`;

    const payload: Record<string, any> = {
      model: modelId,
      image_url: options.sourceImageUrl,
      mask_url: options.maskImageUrl,
      prompt: editPrompt,
      negative_prompt: options.negativePrompt,
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      const res = await fetch("https://openrouter.ai/api/v1/images/edits", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://virlio.com",
          "X-Title": "Virlio Brand Studio",
        },
        body: JSON.stringify(payload),
        signal: options.abortSignal || controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        throw new AIProviderError(
          `OpenRouter Image Editing returned HTTP ${res.status}: ${errorText.slice(0, 300)}`,
          "openrouter",
          modelId,
          "IMAGE_EDITING_FAILED",
          res.status === 429 || res.status >= 500
        );
      }

      const data = await res.json();
      const imageItem = data.data?.[0];
      let imageBuffer: Buffer;

      if (imageItem?.b64_json) {
        imageBuffer = Buffer.from(imageItem.b64_json, "base64");
      } else if (imageItem?.url) {
        const imgFetch = await fetch(imageItem.url);
        const arrayBuf = await imgFetch.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuf);
      } else {
        throw new AIProviderError(
          "OpenRouter edit response did not contain image data or URL",
          "openrouter",
          modelId,
          "IMAGE_EDITING_FAILED"
        );
      }

      return {
        imageBuffer,
        format: "png",
        width: 1024,
        height: 1024,
        revisedPrompt: editPrompt,
        latencyMs: Date.now() - startTime,
        provider: "openrouter",
        model: modelId,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      if (err.name === "AbortError") {
        throw new AIProviderError("Image editing timed out", "openrouter", modelId, "NETWORK_TIMEOUT", true);
      }
      throw new AIProviderError(err.message, "openrouter", modelId, "IMAGE_EDITING_FAILED", false, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  private extractJson(content: string): any {
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return JSON.parse(trimmed);
    }
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
      return JSON.parse(codeBlockMatch[1].trim());
    }
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error("Could not extract JSON payload from response");
  }
}
