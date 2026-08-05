import { z } from "zod";
import { MemeGenerationOutputSchema, type MemeGenerationOutput } from "../schemas/meme-generation.schema";

export interface MemeProviderResponse {
  result: MemeGenerationOutput;
  provider: string;
  model: string;
  tokenUsage: number;
  durationMs: number;
  fallbackCount: number;
}

interface ProviderConfig {
  name: string;
  endpoint: string;
  model: string;
  envKey: string;
  supportsJsonMode: boolean;
}

const PROVIDERS: ProviderConfig[] = [
  {
    name: "groq",
    endpoint: "https://api.groq.com/openai/v1/chat/completions",
    model: "llama-3.3-70b-versatile",
    envKey: "GROQ_API_KEY",
    supportsJsonMode: true,
  },
  {
    name: "openrouter",
    endpoint: "https://openrouter.ai/api/v1/chat/completions",
    model: "google/gemini-2.5-flash",
    envKey: "OPENROUTER_API_KEY",
    supportsJsonMode: false,
  },
  {
    name: "mistral",
    endpoint: "https://api.mistral.ai/v1/chat/completions",
    model: "mistral-large-latest",
    envKey: "MISTRAL_API_KEY",
    supportsJsonMode: true,
  },
];

const MAX_RETRIES = 1;
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Multi-provider LLM engine for structured meme generation.
 * Groq (primary) → OpenRouter (fallback) → Mistral (final fallback).
 *
 * The engine never calls provider SDKs directly — all calls go through
 * a unified OpenAI-compatible chat completions interface.
 *
 * All provider-specific logic is isolated behind this common interface
 * so adding GPT or Gemini later requires only configuration changes.
 */
export class MemeGenerationProvider {
  /**
   * Generate meme captions using the LLM provider chain with automatic failover.
   */
  static async generate(prompt: string): Promise<MemeProviderResponse> {
    const startTime = Date.now();
    let fallbackCount = 0;
    const errors: string[] = [];

    for (const provider of PROVIDERS) {
      const apiKey = process.env[provider.envKey];
      if (!apiKey) {
        console.warn(`[MemeGenerationProvider] ${provider.name}: API key not configured (${provider.envKey})`);
        errors.push(`${provider.name}: API key not configured`);
        fallbackCount++;
        continue;
      }

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          const result = await this.callProvider(provider, apiKey, prompt);
          const durationMs = Date.now() - startTime;

          return {
            result: result.parsed,
            provider: provider.name,
            model: provider.model,
            tokenUsage: result.tokenUsage,
            durationMs,
            fallbackCount,
          };
        } catch (err: any) {
          const msg = err.message || "Unknown error";
          console.warn(
            `[MemeGenerationProvider] ${provider.name} attempt ${attempt + 1} failed: ${msg}`
          );
          errors.push(`${provider.name} (attempt ${attempt + 1}): ${msg}`);

          // Don't retry on validation errors — the response structure is wrong
          if (msg.includes("validation") || msg.includes("ZodError")) {
            break;
          }
        }
      }

      fallbackCount++;
    }

    throw new Error(
      `All meme generation providers failed. Errors:\n${errors.join("\n")}`
    );
  }

  private static async callProvider(
    config: ProviderConfig,
    apiKey: string,
    prompt: string
  ): Promise<{ parsed: MemeGenerationOutput; tokenUsage: number }> {
    const payload: Record<string, any> = {
      model: config.model,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    };

    if (config.supportsJsonMode) {
      payload.response_format = { type: "json_object" };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(config.endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errorBody = await res.text().catch(() => "");
        throw new Error(
          `${config.name} API returned HTTP ${res.status}: ${errorBody.slice(0, 200)}`
        );
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content;
      const tokenUsage = data.usage?.total_tokens || 0;

      if (!content) {
        throw new Error(`${config.name}: Empty response content`);
      }

      // Extract JSON from response (handles markdown code blocks)
      const jsonStr = this.extractJson(content);
      const rawParsed = JSON.parse(jsonStr);
      const validated = MemeGenerationOutputSchema.parse(rawParsed);

      return { parsed: validated, tokenUsage };
    } finally {
      clearTimeout(timeout);
    }
  }

  /**
   * Extracts JSON from a string that may be wrapped in markdown code blocks.
   */
  private static extractJson(content: string): string {
    // Try direct parse first
    const trimmed = content.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      return trimmed;
    }

    // Try extracting from markdown code block
    const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch?.[1]) {
      return codeBlockMatch[1].trim();
    }

    // Try finding JSON object
    const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return jsonMatch[0];
    }

    throw new Error("Could not extract JSON from provider response");
  }
}
