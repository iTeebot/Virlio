import assert from "node:assert";
import {
  createPostSessionSchema,
  generatePostBatchSchema,
  editImageVersionSchema,
  approveVariationSchema,
} from "../lib/validations/brand-posts";

async function runBrandPostsApiTests() {
  console.log("🧪 Running Brand Posts REST API Schema & Contract Tests...");

  // Test 1: createPostSessionSchema Validation with full and empty payloads
  const validSession = {
    title: "Summer 2026 Campaign",
    focus_type: "product" as const,
    selected_product: "Pulse Pro ANC Headphones",
    target_platform: "instagram_feed" as const,
    aspect_ratio: "1:1" as const,
  };
  const parsedSession = createPostSessionSchema.parse(validSession);
  assert.strictEqual(parsedSession.title, "Summer 2026 Campaign");
  assert.strictEqual(parsedSession.focus_type, "product");

  // Empty session payload should parse with smart defaults
  const emptySession = createPostSessionSchema.parse({});
  assert.strictEqual(emptySession.title, "Brand Post Campaign");
  assert.strictEqual(emptySession.focus_type, "general");
  assert.strictEqual(emptySession.target_platform, "instagram_feed");
  assert.strictEqual(emptySession.aspect_ratio, "1:1");

  // Invalid aspect ratio should throw
  assert.throws(() => {
    createPostSessionSchema.parse({
      title: "Bad Ratio",
      aspect_ratio: "invalid_ratio" as any,
    });
  });

  console.log("✓ Test 1 Passed: Session creation schema validates parameters and applies smart defaults when empty");

  // Test 2: generatePostBatchSchema Validation with optional prompt
  const validBatch = {
    session_id: "123e4567-e89b-12d3-a456-426614174000",
    user_prompt: "Create high-impact promotional post highlighting active noise cancellation",
    campaign_goal: "Direct conversion",
    target_platform: "instagram_feed" as const,
    aspect_ratio: "1:1" as const,
    auto_synthesize_images: true,
  };
  const parsedBatch = generatePostBatchSchema.parse(validBatch);
  assert.strictEqual(parsedBatch.session_id, "123e4567-e89b-12d3-a456-426614174000");
  assert.strictEqual(parsedBatch.auto_synthesize_images, true);

  // Omitted prompt should parse cleanly with empty string default (1-click auto-generation)
  const emptyPromptBatch = generatePostBatchSchema.parse({
    session_id: "123e4567-e89b-12d3-a456-426614174000",
  });
  assert.strictEqual(emptyPromptBatch.user_prompt, "");
  assert.strictEqual(emptyPromptBatch.target_platform, "instagram_feed");
  assert.strictEqual(emptyPromptBatch.aspect_ratio, "1:1");
  assert.strictEqual(emptyPromptBatch.auto_synthesize_images, true);

  console.log("✓ Test 2 Passed: Generation batch schema supports 1-click generation with empty/omitted prompt");

  // Test 3: editImageVersionSchema Validation
  const validEdit = {
    parent_version_id: "123e4567-e89b-12d3-a456-426614174001",
    edit_instruction: "Make the background deeper navy and add subtle rim light",
    aspect_ratio: "1:1" as const,
    preserved_elements: ["product geometry", "brand logo"],
  };
  const parsedEdit = editImageVersionSchema.parse(validEdit);
  assert.strictEqual(parsedEdit.parent_version_id, "123e4567-e89b-12d3-a456-426614174001");
  assert.strictEqual(parsedEdit.preserved_elements?.length, 2);

  console.log("✓ Test 3 Passed: Image editing schema validates version lineage IDs and preservation elements");

  // Test 4: approveVariationSchema Validation
  const validApprove = { is_approved: true };
  const parsedApprove = approveVariationSchema.parse(validApprove);
  assert.strictEqual(parsedApprove.is_approved, true);

  const defaultApprove = approveVariationSchema.parse({});
  assert.strictEqual(defaultApprove.is_approved, true);

  console.log("✓ Test 4 Passed: Variation approval schema enforces boolean states");
  console.log("🎉 All Brand Posts REST API Schema & Contract Tests Passed!");
}

runBrandPostsApiTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
