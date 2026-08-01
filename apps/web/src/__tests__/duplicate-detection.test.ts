import assert from "node:assert";
import {
  computeSha256,
  computeCanonicalImageHash,
  computeDHash,
  evaluateDuplicateCandidate,
} from "@virlio/ai";

async function runDuplicateDetectionTests() {
  console.log("Running Template Layered Duplicate Detection Tests...");

  const sampleImageBytesA = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64"
  );

  const sampleImageBytesB = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64"
  );

  // Test 1: Exact same bytes uploaded twice by different users
  const hash1 = computeSha256(sampleImageBytesA);
  const hash2 = computeSha256(sampleImageBytesA);
  assert.strictEqual(hash1, hash2);

  const canonicalHash = await computeCanonicalImageHash(sampleImageBytesA);
  const phash = computeDHash(sampleImageBytesA);

  const candidate = {
    id: "template-user-a-123",
    original_sha256: hash1,
    canonical_image_sha256: canonicalHash,
    perceptual_hash: phash,
  };

  const evalResult1 = evaluateDuplicateCandidate(
    { originalSha256: hash2, canonicalSha256: canonicalHash, perceptualHash: phash },
    candidate
  );

  assert.ok(evalResult1 !== null);
  assert.strictEqual(evalResult1?.isDuplicate, true);
  assert.strictEqual(evalResult1?.duplicateStatus, "exact_duplicate");
  assert.strictEqual(evalResult1?.matchMethod, "original_sha256");
  assert.strictEqual(evalResult1?.matchedTemplateId, "template-user-a-123");
  console.log("✓ Test 1 Passed: Exact same bytes uploaded twice detected");

  // Test 2: Different user metadata hints (Category = Technology vs Travel)
  const candidateUserA = {
    id: "template-tech-001",
    original_sha256: hash1,
    canonical_image_sha256: canonicalHash,
    perceptual_hash: phash,
  };

  const evalUserB = evaluateDuplicateCandidate(
    { originalSha256: hash1, canonicalSha256: canonicalHash, perceptualHash: phash },
    candidateUserA
  );

  assert.strictEqual(evalUserB?.isDuplicate, true);
  assert.strictEqual(evalUserB?.matchedTemplateId, "template-tech-001");
  console.log("✓ Test 2 Passed: Different metadata hints still detected as same image");

  // Test 3: Re-encoded image detected via canonical_image_sha256
  const candidateReEncoded = {
    id: "template-canonical-002",
    original_sha256: "different-raw-sha256-due-to-reencoding",
    canonical_image_sha256: canonicalHash,
    perceptual_hash: phash,
  };

  const evalResult3 = evaluateDuplicateCandidate(
    { originalSha256: hash1, canonicalSha256: canonicalHash, perceptualHash: phash },
    candidateReEncoded
  );

  assert.strictEqual(evalResult3?.isDuplicate, true);
  assert.strictEqual(evalResult3?.duplicateStatus, "exact_duplicate");
  assert.strictEqual(evalResult3?.matchMethod, "canonical_sha256");
  console.log("✓ Test 3 Passed: Canonical image hash match detected");

  // Test 4: Visually distinct images do not match
  const shaB = computeSha256(sampleImageBytesB);
  const canonicalB = await computeCanonicalImageHash(sampleImageBytesB);
  const phashB = computeDHash(sampleImageBytesB);

  const candidateB = {
    id: "template-image-b-999",
    original_sha256: shaB,
    canonical_image_sha256: canonicalB,
    perceptual_hash: "0000000000000000",
  };

  const evalResult4 = evaluateDuplicateCandidate(
    { originalSha256: hash1, canonicalSha256: canonicalHash, perceptualHash: phash },
    candidateB
  );

  assert.strictEqual(evalResult4, null);
  console.log("✓ Test 4 Passed: Visually distinct images do not trigger duplicate flag");

  console.log("All Template Layered Duplicate Detection Tests Passed Successfully!");
}

if (process.env.NODE_ENV !== "production") {
  runDuplicateDetectionTests().catch(console.error);
}
