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

export class MistralAdapter implements AIProviderAdapter {
  public readonly providerName = "mistral";
  private cachedImageAgentId: string | null = null;

  constructor(private apiKey: string = process.env.MISTRAL_API_KEY || "") {}

  public getCapabilities(): ModelCapability[] {
    return DEFAULT_MODEL_REGISTRY.filter((m) => m.provider === "mistral");
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
        "MISTRAL_API_KEY is not configured",
        "mistral",
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
    const timeout = setTimeout(() => controller.abort(), 35000);

    try {
      const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
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
          `Mistral API returned HTTP ${res.status}: ${errorText.slice(0, 300)}`,
          "mistral",
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
            `Failed to parse structured JSON from Mistral: ${e.message}`,
            "mistral",
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
        provider: "mistral",
        model: modelId,
        rawResponse: data,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      if (err.name === "AbortError") {
        throw new AIProviderError("Request timed out", "mistral", modelId, "NETWORK_TIMEOUT", true);
      }
      throw new AIProviderError(err.message, "mistral", modelId, "UNKNOWN", false, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Generates images using Mistral's Agent & Conversation Tools API with image_generation.
   */
  public async generateImage(
    modelId: string,
    options: ImageGenerationOptions
  ): Promise<ImageGenerationResult> {
    if (!this.apiKey) {
      throw new AIProviderError(
        "MISTRAL_API_KEY is not configured",
        "mistral",
        modelId,
        "AUTHENTICATION_ERROR",
        false
      );
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60000);

    try {
      // 1. Get or create Mistral Image Generation Agent
      const agentId = await this.getOrCreateImageAgent(modelId, options.abortSignal || controller.signal);

      // 2. Start conversation with the image generation agent
      const convRes = await fetch("https://api.mistral.ai/v1/conversations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          agent_id: agentId,
          inputs: options.prompt,
        }),
        signal: options.abortSignal || controller.signal,
      });

      if (!convRes.ok) {
        const errorText = await convRes.text().catch(() => "");
        throw new AIProviderError(
          `Mistral Conversations API returned HTTP ${convRes.status}: ${errorText.slice(0, 300)}`,
          "mistral",
          modelId,
          "IMAGE_GENERATION_FAILED",
          convRes.status === 429 || convRes.status >= 500
        );
      }

      const convData = await convRes.json();

      // 3. Extract file_id from outputs
      const fileId = this.extractFileIdFromOutputs(convData);
      if (!fileId) {
        throw new AIProviderError(
          "Mistral image agent response did not contain a generated image file ID",
          "mistral",
          modelId,
          "IMAGE_GENERATION_FAILED"
        );
      }

      // 4. Download file content
      const fileRes = await fetch(`https://api.mistral.ai/v1/files/${fileId}/content`, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
        signal: options.abortSignal || controller.signal,
      });

      if (!fileRes.ok) {
        throw new AIProviderError(
          `Failed to download image file from Mistral (HTTP ${fileRes.status})`,
          "mistral",
          modelId,
          "IMAGE_GENERATION_FAILED"
        );
      }

      const arrayBuf = await fileRes.arrayBuffer();
      const imageBuffer = Buffer.from(arrayBuf);

      return {
        imageBuffer,
        format: "png",
        width: 1024,
        height: 1024,
        seed: options.seed,
        latencyMs: Date.now() - startTime,
        provider: "mistral",
        model: modelId,
      };
    } catch (err: any) {
      if (err instanceof AIProviderError) throw err;
      if (err.name === "AbortError") {
        throw new AIProviderError("Mistral image generation timed out", "mistral", modelId, "NETWORK_TIMEOUT", true);
      }
      throw new AIProviderError(err.message, "mistral", modelId, "IMAGE_GENERATION_FAILED", false, err);
    } finally {
      clearTimeout(timeout);
    }
  }

  public async editImage(
    modelId: string,
    options: ImageEditingOptions
  ): Promise<ImageEditingResult> {
    // Mistral image editing delegates through prompt-assisted generation
    const editPrompt = `${options.editInstruction}. Preserving: ${options.preservedElements.join(", ")}.`;
    const genResult = await this.generateImage(modelId, {
      prompt: editPrompt,
      negativePrompt: options.negativePrompt,
      aspectRatio: options.aspectRatio,
    });

    return {
      imageBuffer: genResult.imageBuffer,
      format: genResult.format,
      width: genResult.width,
      height: genResult.height,
      latencyMs: genResult.latencyMs,
      provider: "mistral",
      model: modelId,
    };
  }

  private async getOrCreateImageAgent(modelId: string, signal?: AbortSignal): Promise<string> {
    if (this.cachedImageAgentId) return this.cachedImageAgentId;

    const res = await fetch("https://api.mistral.ai/v1/agents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: modelId.includes("mistral-") ? modelId : "mistral-medium-latest",
        name: "Virlio Brand Image Agent",
        description: "Agent used to generate brand visual images.",
        instructions: "Use the image generation tool to synthesize high-quality commercial images according to user prompts.",
        tools: [{ type: "image_generation" }],
      }),
      signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new AIProviderError(
        `Failed to initialize Mistral Image Agent (HTTP ${res.status}): ${errText.slice(0, 200)}`,
        "mistral",
        modelId,
        "IMAGE_GENERATION_FAILED"
      );
    }

    const data = await res.json();
    this.cachedImageAgentId = data.id;
    return data.id;
  }

  private extractFileIdFromOutputs(convData: any): string | null {
    if (!convData) return null;
    const outputs = convData.outputs || [];

    for (const output of outputs) {
      const content = output.content;
      if (Array.isArray(content)) {
        for (const chunk of content) {
          if (chunk.type === "tool_file" && chunk.file_id) {
            return chunk.file_id;
          }
          if (chunk.tool === "image_generation" && chunk.file_id) {
            return chunk.file_id;
          }
        }
      }
    }

    // Direct output check
    if (convData.file_id) return convData.file_id;
    return null;
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
