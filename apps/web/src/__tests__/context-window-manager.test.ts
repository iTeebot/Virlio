import assert from "node:assert";
import {
  ContextWindowManager,
  LayeredConversationMemory,
  estimateTokens,
  MemoryPriority,
  WorkingContextPayload,
} from "@virlio/ai";

async function runContextWindowManagerTests() {
  console.log("🧪 Running Layered Memory & Context Window Management Tests...");

  const contextManager = new ContextWindowManager();
  const memory = new LayeredConversationMemory(contextManager);

  // Test 1: Token Estimation Accuracy
  const shortText = "Create a modern summer collection post.";
  const shortTokens = estimateTokens(shortText);
  assert.ok(shortTokens >= 6 && shortTokens <= 12, `Estimated tokens (${shortTokens}) for short text in expected range`);

  const jsonPayload = { brand: "Virlio", colors: ["#2563EB", "#1E40AF"], count: 4 };
  const jsonTokens = estimateTokens(jsonPayload);
  assert.ok(jsonTokens >= 15 && jsonTokens <= 30, `Estimated tokens (${jsonTokens}) for JSON payload in expected range`);

  console.log("✓ Test 1 Passed: Token estimation works reliably for text and structured payloads");

  // Test 2: Budget Calculation for Various Context Sizes
  const budget4k = contextManager.calculateBudget(4096, 500, 1000);
  assert.strictEqual(budget4k.netAvailableBudget, 2596);

  const budget128k = contextManager.calculateBudget(128000, 1000, 4096);
  assert.strictEqual(budget128k.netAvailableBudget, 122904);

  console.log("✓ Test 2 Passed: Dynamic token budgeting computes correct allocations");

  // Sample Working Context Payload
  const samplePayload: WorkingContextPayload = {
    currentUserInstruction: "Change the background color to brand navy and brighten lighting.",
    activeImageVersion: {
      versionId: "ver_101",
      versionNumber: 2,
      parentVersionId: "ver_100",
      editInstruction: "Initial generation",
      fullPrompt: "Product photo of organic water bottle on stone pedestal with natural sunlight",
      seed: 42,
      aspectRatio: "1:1",
      imageUrl: "https://res.cloudinary.com/virlio/image/upload/v1/sample.png",
      provider: "openrouter",
      model: "recraft-ai/recraft-v3",
    },
    brandMemory: {
      brandId: "brand_abc",
      brandName: "Aura Botanicals",
      industry: "Health & Wellness",
      colors: {
        primary: "#0D9488",
        secondary: "#115E59",
        accent: "#14B8A6",
        darkBackground: "#0F172A",
        lightBackground: "#F0FDF4",
      },
      typography: {
        fontFamily: "Inter",
        style: "Modern Sans",
      },
      logoRule: "Top-left placement",
      prohibitedStyles: ["gradients", "clutter", "neon glow"],
      prohibitedColors: ["#FF00FF"],
      personality: ["Clean", "Organic", "Modern"],
      toneOfVoice: "Calm & Premium",
      products: ["Organic Facial Serum", "Hydrating Mist", "Botanical Night Cream"],
      usps: ["100% Organic", "Cruelty Free", "Eco-friendly Glass Packaging"],
      targetAudience: "25-45 eco-conscious skincare buyers",
    },
    sessionMemory: {
      sessionId: "sess_xyz",
      brandId: "brand_abc",
      title: "Q3 Skincare Launch",
      focusType: "product",
      targetPlatform: "instagram_feed",
      aspectRatio: "1:1",
    },
    selectedCreativeDirection: "Hero Product Feature Shot with clean botanical studio backdrop",
    recentEditHistory: [
      { versionNumber: 1, editInstruction: "Original product generation" },
      { versionNumber: 2, editInstruction: "Tightened framing and adjusted shadows" },
    ],
    generationHistory: [
      {
        generationId: "gen_001",
        userPrompt: "Initial launch concepts",
        createdAt: new Date().toISOString(),
        variationsSummary: [
          { variationIndex: 1, creativeDirection: "Hero Product", headline: "Pure Nature" },
          { variationIndex: 2, creativeDirection: "Lifestyle", headline: "Morning Routine" },
        ],
      },
    ],
  };

  // Test 3: Large Context Window (128K) - All 7 Layers Preserved in Full Detail
  const largeResult = memory.buildPromptContext(samplePayload, 128000);
  assert.strictEqual(largeResult.allocation.isTruncated, false);
  assert.strictEqual(largeResult.allocation.droppedItems.length, 0);
  assert.ok(largeResult.contextString.includes("Aura Botanicals"));
  assert.ok(largeResult.contextString.includes("Change the background color to brand navy"));
  assert.ok(largeResult.contextString.includes("Organic Facial Serum"));
  assert.ok(largeResult.contextString.includes("Version 2"));

  console.log("✓ Test 3 Passed: 128K context model retains all 7 memory layers in full fidelity");

  // Test 4: Small / Constrained Context Window (Tiny budget)
  // Even with only 400 available tokens, P1, P2, P3 must NEVER be dropped.
  const constrainedBudget = contextManager.calculateBudget(2000, 800, 900); // 300 net tokens
  const memoryItems = memory.createMemoryItems(samplePayload);
  const constrainedAllocation = contextManager.allocateContext(memoryItems, constrainedBudget);

  const retainedPriorities = constrainedAllocation.retainedItems.map((item) => item.priority);
  assert.ok(
    retainedPriorities.includes(MemoryPriority.P1_CURRENT_USER_INSTRUCTION),
    "P1 (User instruction) must ALWAYS be retained"
  );
  assert.ok(
    retainedPriorities.includes(MemoryPriority.P2_CURRENT_IMAGE_VERSION),
    "P2 (Active Image Version) must ALWAYS be retained"
  );
  assert.ok(
    retainedPriorities.includes(MemoryPriority.P3_BRAND_VISUAL_PROFILE),
    "P3 (Brand Visual Profile) must ALWAYS be retained"
  );

  // Verify that P7 (older history) was dropped/pruned to protect core budget
  const droppedPriorities = constrainedAllocation.droppedItems.map((item) => item.priority);
  assert.ok(
    droppedPriorities.includes(MemoryPriority.P7_OLDER_SESSION_HISTORY),
    "P7 must be pruned when budget is constrained"
  );

  console.log("✓ Test 4 Passed: Priority Hierarchy strictly preserves P1–P3 under tight context limits");

  // Test 5: Prompt Context String Formatting & Solid Color Preservation Rule
  assert.ok(
    largeResult.contextString.includes("CRISP SOLID COLORS ONLY - NO GRADIENTS"),
    "Brand Visual Profile must enforce Virlio's solid color constraint"
  );

  console.log("✓ Test 5 Passed: Prompt context enforces brand rules and solid color standards");
  console.log("🎉 All Layered Memory & Context Window Management Tests Passed!");
}

runContextWindowManagerTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
