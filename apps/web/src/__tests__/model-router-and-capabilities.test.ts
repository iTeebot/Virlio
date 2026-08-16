import assert from "node:assert";
import {
  ModelCapabilityRegistry,
  ModelRouter,
  FallbackHandler,
  AIProviderError,
  ModelCapability,
  AIProviderAdapter,
} from "@virlio/ai";

async function runModelRouterAndCapabilitiesTests() {
  console.log("🧪 Running Model Capability Registry & Routing Tests...");

  const registry = new ModelCapabilityRegistry();

  // Test 1: Registry Initialization & Capability Filtering
  const allModels = registry.getAllModels();
  assert.ok(allModels.length >= 6, "Expected at least 6 models registered by default");

  const imageGenModels = registry.findCapableModels({ requiresImageGeneration: true });
  assert.ok(imageGenModels.length >= 3, "Expected at least 3 image generation models");
  for (const m of imageGenModels) {
    assert.strictEqual(m.supportsImageGeneration, true, `Model ${m.modelId} must support image generation`);
  }

  const imageEditingModels = registry.findCapableModels({ requiresImageEditing: true });
  assert.ok(imageEditingModels.length >= 2, "Expected at least 2 image editing models (Recraft, Imagen 3)");
  for (const m of imageEditingModels) {
    assert.strictEqual(m.supportsImageEditing, true, `Model ${m.modelId} must support image editing`);
  }

  console.log("✓ Test 1 Passed: Capability filtering correctly filters models");

  // Test 2: Dynamic Model Status Updates
  const updateSuccess = registry.updateModelStatus("groq", "llama-3.3-70b-versatile", "disabled");
  assert.strictEqual(updateSuccess, true);
  const disabledModel = registry.getModel("groq", "llama-3.3-70b-versatile");
  assert.strictEqual(disabledModel?.status, "disabled");

  const activeStructured = registry.findCapableModels({ requiresStructuredOutput: true });
  assert.ok(
    !activeStructured.some((m) => m.modelId === "llama-3.3-70b-versatile" && m.provider === "groq"),
    "Disabled model must be excluded from findCapableModels"
  );

  // Restore model status
  registry.updateModelStatus("groq", "llama-3.3-70b-versatile", "active");
  console.log("✓ Test 2 Passed: Dynamic model status toggles work seamlessly");

  // Test 3: Model Router Capability Enforcement & Selection
  const router = new ModelRouter(registry);

  // 3a: Concept Ideation routes to fast structured LLM (Groq Llama 3.3)
  const ideationRoute = router.selectRoute({ operation: "CONCEPT_IDEATION" });
  assert.strictEqual(ideationRoute.provider, "groq");
  assert.strictEqual(ideationRoute.supportsStructuredOutput, true);

  // 3b: Image Generation routes to Flux / Recraft (NOT Groq or Mistral)
  const imageGenRoute = router.selectRoute({ operation: "IMAGE_GENERATION" });
  assert.strictEqual(imageGenRoute.supportsImageGeneration, true);
  assert.notStrictEqual(imageGenRoute.provider, "groq");
  assert.notStrictEqual(imageGenRoute.provider, "mistral");

  // 3c: Image Editing routes to Recraft / Imagen 3 (Never text-only or Flux 1.1)
  const imageEditRoute = router.selectRoute({ operation: "IMAGE_EDITING" });
  assert.strictEqual(imageEditRoute.supportsImageEditing, true);
  assert.notStrictEqual(imageEditRoute.modelId, "black-forest-labs/flux-1.1-pro");

  console.log("✓ Test 3 Passed: Operation capability requirements strictly enforced");

  // Test 4: Guaranteed-Compatible Fallback Chain
  const fallbackChain = router.getFallbackChain({ operation: "IMAGE_EDITING" });
  assert.ok(fallbackChain.length >= 2, "Fallback chain must contain all capable models");
  for (const m of fallbackChain) {
    assert.strictEqual(m.supportsImageEditing, true, `Fallback candidate ${m.modelId} must support image editing`);
  }
  console.log("✓ Test 4 Passed: Fallback chain is 100% capability-compatible");

  // Test 5: FallbackHandler Multi-Provider Failover Execution
  let groqCalled = false;
  let mistralCalled = false;

  const mockGroqAdapter: AIProviderAdapter = {
    providerName: "groq",
    getCapabilities: () => registry.findCapableModels({ provider: "groq" }),
    isHealthy: async () => true,
    generateText: async () => {
      groqCalled = true;
      throw new AIProviderError("Simulated Groq 500 Failure", "groq", "mock-model", "NETWORK_TIMEOUT", true);
    },
    generateImage: async () => { throw new Error("Unsupported"); },
    editImage: async () => { throw new Error("Unsupported"); },
  };

  const mockMistralAdapter: AIProviderAdapter = {
    providerName: "mistral",
    getCapabilities: () => registry.findCapableModels({ provider: "mistral" }),
    isHealthy: async () => true,
    generateText: async () => {
      mistralCalled = true;
      return {
        content: JSON.stringify({ concepts: ["Concept 1", "Concept 2"] }),
        parsedJson: { concepts: ["Concept 1", "Concept 2"] },
        tokenUsage: { inputTokens: 50, outputTokens: 50, totalTokens: 100 },
        latencyMs: 120,
        provider: "mistral",
        model: "mistral-large-latest",
      };
    },
    generateImage: async () => { throw new Error("Unsupported"); },
    editImage: async () => { throw new Error("Unsupported"); },
  };

  const fallbackHandler = new FallbackHandler(router);
  fallbackHandler.registerAdapter(mockGroqAdapter);
  fallbackHandler.registerAdapter(mockMistralAdapter);

  const fallbackResult = await fallbackHandler.executeWithFallback(
    { operation: "CONCEPT_IDEATION" },
    async (adapter, model) => {
      return adapter.generateText(model.modelId, { messages: [{ role: "user", content: "Hello" }] });
    }
  );

  assert.strictEqual(groqCalled, true, "Primary provider (Groq) should have been called first");
  assert.strictEqual(mistralCalled, true, "Fallback provider (Mistral) should have been called upon Groq failure");
  assert.strictEqual(fallbackResult.provider, "mistral");
  assert.strictEqual(fallbackResult.fallbackCount, 1);
  assert.ok(fallbackResult.result.parsedJson.concepts.length === 2);

  console.log("✓ Test 5 Passed: Dynamic failover across providers executes seamlessly");
  console.log("🎉 All Model Capability Registry & Routing Tests Passed!");
}

runModelRouterAndCapabilitiesTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
