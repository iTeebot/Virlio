import assert from "node:assert";
import * as brandPostRepository from "../server/repositories/brand-post.repository";

async function runBrandPostRepositoryTests() {
  console.log("🧪 Running Brand Post Repository Signature & Type Verification Tests...");

  // 1. Verify all expected functions are exported
  const expectedFunctions = [
    "createSession",
    "findSessionById",
    "findSessionsByBrand",
    "findSessionWithDetails",
    "updateSession",
    "softDeleteSession",
    "createGeneration",
    "findGenerationById",
    "findGenerationsBySession",
    "updateGenerationStatus",
    "createVariation",
    "createVariationsBatch",
    "findVariationById",
    "findVariationsByGeneration",
    "findVariationsBySession",
    "updateVariation",
    "setActiveVersion",
    "setApproved",
    "createImageVersion",
    "findImageVersionById",
    "findImageVersionsByVariation",
    "getLatestVersionNumber",
    "findImageVersionLineage",
    "upsertMemory",
    "findMemoriesBySession",
    "deleteMemory",
  ];

  for (const fnName of expectedFunctions) {
    assert.strictEqual(
      typeof (brandPostRepository as any)[fnName],
      "function",
      `Expected ${fnName} to be exported as a function from brand-post.repository`
    );
  }

  console.log("✅ All 26 Brand Post Repository methods exist and are callable!");
}

runBrandPostRepositoryTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
