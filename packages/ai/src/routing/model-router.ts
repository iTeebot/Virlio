import {
  AIOperationType,
  ModelCapability,
  AIProviderError,
} from "../types/provider.types";
import { ModelCapabilityRegistry, globalModelRegistry } from "./model-capability.registry";

export interface RouteSelectionRequest {
  operation: AIOperationType;
  requiredCapabilities?: {
    requiresVision?: boolean;
    requiresImageGeneration?: boolean;
    requiresImageEditing?: boolean;
    requiresStructuredOutput?: boolean;
  };
  minimumContextTokens?: number;
  preferredProvider?: string;
  preferredModelId?: string;
}

export class ModelRouter {
  constructor(private registry: ModelCapabilityRegistry = globalModelRegistry) {}

  /**
   * Resolves the required capabilities automatically from the operation type
   * if not explicitly overridden in the request.
   */
  public resolveCapabilitiesForOperation(operation: AIOperationType): {
    requiresVision?: boolean;
    requiresImageGeneration?: boolean;
    requiresImageEditing?: boolean;
    requiresStructuredOutput?: boolean;
  } {
    switch (operation) {
      case "CONCEPT_IDEATION":
      case "PROMPT_SYNTHESIS":
        return { requiresStructuredOutput: true };
      case "IMAGE_GENERATION":
      case "IMAGE_VARIATION":
        return { requiresImageGeneration: true };
      case "IMAGE_EDITING":
        return { requiresImageEditing: true };
      case "VISION_CRITIQUE":
        return { requiresVision: true, requiresStructuredOutput: true };
      case "TEXT_COMPLETION":
      default:
        return {};
    }
  }

  /**
   * Selects the single best active model matching the required capabilities.
   * Throws AIProviderError if no compatible model exists.
   */
  public selectRoute(request: RouteSelectionRequest): ModelCapability {
    const requiredCaps = {
      ...this.resolveCapabilitiesForOperation(request.operation),
      ...request.requiredCapabilities,
    };

    const candidates = this.registry.findCapableModels({
      ...requiredCaps,
      minimumContextTokens: request.minimumContextTokens,
    });

    if (candidates.length === 0) {
      throw new AIProviderError(
        `No capable model found for operation: ${request.operation}. Required: ${JSON.stringify(requiredCaps)}`,
        "router",
        "unknown",
        "INCOMPATIBLE_CAPABILITY"
      );
    }

    // 1. Exact modelId preference match (if capable)
    if (request.preferredModelId) {
      const exact = candidates.find(
        (c) => c.modelId.toLowerCase() === request.preferredModelId?.toLowerCase()
      );
      if (exact && exact.status === "active") return exact;
    }

    // 2. Preferred provider match (if capable)
    if (request.preferredProvider) {
      const providerMatches = candidates
        .filter((c) => c.provider.toLowerCase() === request.preferredProvider?.toLowerCase() && c.status === "active")
        .sort((a, b) => a.priority - b.priority);
      if (providerMatches.length > 0) return providerMatches[0];
    }

    // 3. Select active model with highest priority (lowest priority number)
    const activeCandidates = candidates.filter((c) => c.status === "active");
    if (activeCandidates.length > 0) {
      return activeCandidates.sort((a, b) => a.priority - b.priority)[0];
    }

    // 4. Degraded candidates fallback if no active available
    return candidates.sort((a, b) => a.priority - b.priority)[0];
  }

  /**
   * Returns an ordered fallback chain of compatible models.
   * GUARANTEED: Every model in this chain has the required capabilities for the operation.
   */
  public getFallbackChain(request: RouteSelectionRequest): ModelCapability[] {
    const requiredCaps = {
      ...this.resolveCapabilitiesForOperation(request.operation),
      ...request.requiredCapabilities,
    };

    const candidates = this.registry.findCapableModels({
      ...requiredCaps,
      minimumContextTokens: request.minimumContextTokens,
    });

    return candidates.sort((a, b) => {
      // Sort by status ('active' first, then 'degraded')
      if (a.status !== b.status) {
        return a.status === "active" ? -1 : 1;
      }
      return a.priority - b.priority;
    });
  }
}

export const globalModelRouter = new ModelRouter();
