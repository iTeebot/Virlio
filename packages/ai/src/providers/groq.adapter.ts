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

export class GroqAdapter implements AIProviderAdapter {
  public readonly providerName = "groq";

  constructor(private apiKey: string = process.env.GROQ_API_KEY || "") {}

  public getCapabilities(): ModelCapability[] {
    return DEFAULT_MODEL_REGISTRY.filter((m) => m.provider === "groq");
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
        "GROQ_API_KEY is not configured",
        "groq",
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
    const timeout = setTimeout(() => controller.abort(), 30000);

    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: options.abortSignal || controller.signal,
      });

      if (!res.ok) {
        const errorText = await res.text().catch(() => "");
        const isRateLimit = res.status === 429;
        throw new AIProviderError(
          `Groq API returned HTTP ${res.status}: ${errorText.slice(0, 300)}`,
          "groq",
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
            `Failed to parse structured JSON from Groq: ${e.message}`,
            "groq",
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
        provider: "groq",
        model: modelId,
        rawResponse: data,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      if (err.name === "AbortError") {
        throw new AIProviderError("Request timed out", "groq", modelId, "NETWORK_TIMEOUT", true);
      }
      throw new AIProviderError(err.message, "groq", modelId, "UNKNOWN", false, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  public async generateImage(
    modelId: string,
    _options: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    throw new AIProviderError(
      "Groq does not natively support direct text-to-image synthesis",
      "groq",
      modelId,
      "INCOMPATIBLE_CAPABILITY",
      false
    );
  }

  public async editImage(
    modelId: string,
    _options: ImageEditingOptions
  ): Promise<ImageEditingResult> {
    throw new AIProviderError(
      "Groq does not natively support direct image editing / inpainting",
      "groq",
      modelId,
      "INCOMPATIBLE_CAPABILITY",
      false
    );
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
