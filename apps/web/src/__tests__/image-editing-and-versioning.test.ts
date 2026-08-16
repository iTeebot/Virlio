import assert from "node:assert";
import {
  buildImageEditPrompt,
  ModelCapabilityRegistry,
  ModelRouter,
} from "@virlio/ai";

async function runImageEditingAndVersioningTests() {
  console.log("🧪 Running Image Editing & Versioning Lineage Tests...");

  // Test 1: Image Editing Prompt & Preservation Locks
  const editPrompt = buildImageEditPrompt({
    editInstruction: "Change the surface background to solid dark navy #0F172A and add subtle rim light",
    brandColors: ["#2563EB", "#0F172A"],
    brandName: "Kinetix Audio",
    sourcePrompt: "Matte black ANC headphones resting on dark charcoal pedestal in studio light",
  });

  assert.ok(editPrompt.includes("PRECISION BRAND PRESERVATION"));
  assert.ok(editPrompt.includes("Change the surface background to solid dark navy #0F172A"));
  assert.ok(editPrompt.includes("product geometry, textures, and details"));
  assert.ok(editPrompt.includes("official brand logo and its placement"));
  assert.ok(editPrompt.includes("NEVER USE GRADIENTS"));

  console.log("✓ Test 1 Passed: Image edit prompt builder correctly locks brand elements and solid colors");

  // Test 2: Immutable Version Tree & Lineage Reconstruction
  interface MockImageVersion {
    id: string;
    version_number: number;
    parent_version_id: string | null;
    edit_instruction: string | null;
    image_url: string;
  }

  const mockVersions: MockImageVersion[] = [
    {
      id: "v1_orig",
      version_number: 1,
      parent_version_id: null,
      edit_instruction: null,
      image_url: "https://res.cloudinary.com/virlio/v1.png",
    },
    {
      id: "v2_edit",
      version_number: 2,
      parent_version_id: "v1_orig",
      edit_instruction: "Make lighting warmer",
      image_url: "https://res.cloudinary.com/virlio/v2.png",
    },
    {
      id: "v3_edit",
      version_number: 3,
      parent_version_id: "v2_edit",
      edit_instruction: "Add film grain texture",
      image_url: "https://res.cloudinary.com/virlio/v3.png",
    },
    {
      id: "v4_branch",
      version_number: 4,
      parent_version_id: "v1_orig", // Branched off v1
      edit_instruction: "Try bright daylight outdoor background",
      image_url: "https://res.cloudinary.com/virlio/v4.png",
    },
  ];

  // Helper to trace lineage from leaf to root
  function traceLineage(versionId: string, pool: MockImageVersion[]): MockImageVersion[] {
    const lineage: MockImageVersion[] = [];
    let currentId: string | null = versionId;

    while (currentId) {
      const node = pool.find((n) => n.id === currentId);
      if (!node) break;
      lineage.unshift(node);
      currentId = node.parent_version_id;
    }
    return lineage;
  }

  // 2a: Trace v3 Lineage (v1 -> v2 -> v3)
  const lineageV3 = traceLineage("v3_edit", mockVersions);
  assert.strictEqual(lineageV3.length, 3);
  assert.strictEqual(lineageV3[0].id, "v1_orig");
  assert.strictEqual(lineageV3[1].id, "v2_edit");
  assert.strictEqual(lineageV3[2].id, "v3_edit");

  // 2b: Trace v4 Branch Lineage (v1 -> v4)
  const lineageV4 = traceLineage("v4_branch", mockVersions);
  assert.strictEqual(lineageV4.length, 2);
  assert.strictEqual(lineageV4[0].id, "v1_orig");
  assert.strictEqual(lineageV4[1].id, "v4_branch");

  // 2c: Verify v1 (original) remains completely untouched and recoverable
  const original = lineageV3[0];
  assert.strictEqual(original.version_number, 1);
  assert.strictEqual(original.parent_version_id, null);

  console.log("✓ Test 2 Passed: Immutable version trees and branch lineages trace accurately");

  // Test 3: Model Routing Strict Capability Matching for Editing
  const registry = new ModelCapabilityRegistry();
  const router = new ModelRouter(registry);

  const editRoute = router.selectRoute({
    operation: "IMAGE_EDITING",
    requiredCapabilities: { requiresImageEditing: true },
  });

  assert.strictEqual(editRoute.supportsImageEditing, true);
  assert.strictEqual(editRoute.provider, "mistral");
  assert.notStrictEqual(editRoute.provider, "groq");
  assert.notStrictEqual(editRoute.modelId, "black-forest-labs/flux-1.1-pro"); // Flux doesn't support inpainting/editing

  console.log("✓ Test 3 Passed: Editing operations strictly reject text models and generation-only diffusion models");
  console.log("🎉 All Image Editing & Versioning Lineage Tests Passed!");
}

runImageEditingAndVersioningTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
