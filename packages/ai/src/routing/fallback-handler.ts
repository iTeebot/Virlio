import {
  AIOperationType,
  ModelCapability,
  AIProviderAdapter,
  AIProviderError,
} from "../types/provider.types";
import { ModelRouter, RouteSelectionRequest, globalModelRouter } from "./model-router";

export interface ExecutionAttempt {
  provider: string;
  model: string;
  attemptNumber: number;
  durationMs: number;
  error?: string;
  errorCode?: string;
}

export interface FallbackExecutionResult<T> {
  result: T;
  provider: string;
  model: string;
  attempts: ExecutionAttempt[];
  totalDurationMs: number;
  fallbackCount: number;
}

export class FallbackHandler {
  constructor(
    private router: ModelRouter = globalModelRouter,
    private adapterRegistry: Map<string, AIProviderAdapter> = new Map()
  ) {}

  public registerAdapter(adapter: AIProviderAdapter): void {
    this.adapterRegistry.set(adapter.providerName.toLowerCase(), adapter);
  }

  public getAdapter(providerName: string): AIProviderAdapter | null {
    return this.adapterRegistry.get(providerName.toLowerCase()) || null;
  }

  /**
   * Executes an operation across the compatible fallback chain.
   * If a provider fails, automatically logs attempt and moves to next compatible model.
   */
  public async executeWithFallback<T>(
    request: RouteSelectionRequest,
    executor: (adapter: AIProviderAdapter, model: ModelCapability) => Promise<T>,
    maxRetriesPerModel: number = 1
  ): Promise<FallbackExecutionResult<T>> {
    const startTime = Date.now();
    const fallbackChain = this.router.getFallbackChain(request);

    if (fallbackChain.length === 0) {
      throw new AIProviderError(
        `No compatible models available for operation: ${request.operation}`,
        "fallback_handler",
        "unknown",
        "INCOMPATIBLE_CAPABILITY"
      );
    }

    const attempts: ExecutionAttempt[] = [];
    let fallbackCount = 0;

    for (const model of fallbackChain) {
      const adapter = this.getAdapter(model.provider);
      if (!adapter) {
        attempts.push({
          provider: model.provider,
          model: model.modelId,
          attemptNumber: 1,
          durationMs: 0,
          error: `No adapter registered for provider: ${model.provider}`,
          errorCode: "INCOMPATIBLE_CAPABILITY",
        });
        fallbackCount++;
        continue;
      }

      for (let attempt = 1; attempt <= maxRetriesPerModel; attempt++) {
        const attemptStart = Date.now();
        try {
          const result = await executor(adapter, model);
          const attemptDuration = Date.now() - attemptStart;

          attempts.push({
            provider: model.provider,
            model: model.modelId,
            attemptNumber: attempt,
            durationMs: attemptDuration,
          });

          return {
            result,
            provider: model.provider,
            model: model.modelId,
            attempts,
            totalDurationMs: Date.now() - startTime,
            fallbackCount,
          };
        } catch (err: any) {
          const attemptDuration = Date.now() - attemptStart;
          const errorMessage = err.message || "Unknown error during provider execution";
          const errorCode = err.code || "UNKNOWN";

          attempts.push({
            provider: model.provider,
            model: model.modelId,
            attemptNumber: attempt,
            durationMs: attemptDuration,
            error: errorMessage,
            errorCode,
          });

          // Non-retryable errors (e.g. malformed prompt/JSON) should skip further retries for this model
          if (err instanceof AIProviderError && !err.retryable) {
            break;
          }
        }
      }

      fallbackCount++;
    }

    const failureSummary = attempts
      .map((a) => `[${a.provider}:${a.model}] (attempt ${a.attemptNumber}) -> ${a.errorCode}: ${a.error}`)
      .join("\n");

    throw new AIProviderError(
      `All compatible providers failed for operation ${request.operation}:\n${failureSummary}`,
      "fallback_handler",
      "multiple",
      "UNKNOWN",
      false
    );
  }
}
