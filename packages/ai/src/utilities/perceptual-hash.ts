import crypto from "node:crypto";

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  duplicateStatus: "unique" | "exact_duplicate" | "visual_duplicate" | "possible_duplicate" | "needs_review";
  confidence: number;
  matchedTemplateId?: string;
  matchMethod?: "original_sha256" | "canonical_sha256" | "perceptual_hash" | "visual_similarity";
  reasoning?: string;
}

/**
 * Computes exact SHA-256 hex hash of a buffer.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Normalizes an image buffer to canonical form (orientation, 500x500 max dimensions, PNG format).
 */
export async function computeCanonicalBuffer(buffer: Buffer): Promise<Buffer> {
  if (!buffer || buffer.length === 0) return buffer;
  try {
    const req = eval("require");
    const sharp = req("sharp");
    return await sharp(buffer)
      .rotate()
      .resize(500, 500, { fit: "inside", withoutEnlargement: true })
      .toFormat("png", { compressionLevel: 9, force: true })
      .toBuffer();
  } catch {
    return buffer;
  }
}

/**
 * Computes SHA-256 of the normalized canonical image buffer.
 */
export async function computeCanonicalImageHash(buffer: Buffer): Promise<string> {
  const canonicalBuffer = await computeCanonicalBuffer(buffer);
  return computeSha256(canonicalBuffer);
}

/**
 * Computes a difference hash (dHash) for an image buffer.
 */
export function computeDHash(buffer: Buffer): string {
  if (!buffer || buffer.length < 64) {
    return computeSha256(buffer).substring(0, 16);
  }

  const sampleSize = 64;
  const step = Math.max(1, Math.floor(buffer.length / sampleSize));
  let hashBits = "";

  for (let i = 0; i < sampleSize - 1; i++) {
    const b1 = buffer[i * step] || 0;
    const b2 = buffer[(i + 1) * step] || 0;
    hashBits += b1 > b2 ? "1" : "0";
  }

  let hex = "";
  for (let i = 0; i < hashBits.length; i += 4) {
    const chunk = hashBits.substring(i, i + 4).padEnd(4, "0");
    hex += parseInt(chunk, 2).toString(16);
  }

  return hex;
}

/**
 * Calculates hamming distance between two hex hash strings.
 */
export function hammingDistance(hex1: string, hex2: string): number {
  if (!hex1 || !hex2 || hex1.length !== hex2.length) return 999;

  let distance = 0;
  for (let i = 0; i < hex1.length; i++) {
    const val1 = parseInt(hex1[i], 16);
    const val2 = parseInt(hex2[i], 16);
    let xor = val1 ^ val2;
    while (xor > 0) {
      distance += xor & 1;
      xor >>= 1;
    }
  }

  return distance;
}

/**
 * Evaluates a candidate against new image hashes using Level 1 - 3 layered fingerprint strategy.
 */
export function evaluateDuplicateCandidate(
  newHashes: {
    originalSha256: string;
    canonicalSha256: string;
    perceptualHash: string;
  },
  candidate: {
    id: string;
    original_sha256?: string | null;
    canonical_image_sha256?: string | null;
    perceptual_hash?: string | null;
    sha256_hash?: string | null;
    phash?: string | null;
  },
  thresholds = { exactPhash: 0, nearPhash: 3, possiblePhash: 6 }
): DuplicateCheckResult | null {
  const candidateOriginalSha = candidate.original_sha256 || candidate.sha256_hash;
  const candidateCanonicalSha = candidate.canonical_image_sha256;
  const candidatePhash = candidate.perceptual_hash || candidate.phash;

  // Level 1: Original SHA-256 (Exact Byte Match)
  if (candidateOriginalSha && candidateOriginalSha === newHashes.originalSha256) {
    return {
      isDuplicate: true,
      duplicateStatus: "exact_duplicate",
      confidence: 100,
      matchedTemplateId: candidate.id,
      matchMethod: "original_sha256",
      reasoning: "Exact byte-for-byte SHA-256 match found in database.",
    };
  }

  // Level 2: Canonical SHA-256 (Image-only Normalized Match)
  if (candidateCanonicalSha && candidateCanonicalSha === newHashes.canonicalSha256) {
    return {
      isDuplicate: true,
      duplicateStatus: "exact_duplicate",
      confidence: 99,
      matchedTemplateId: candidate.id,
      matchMethod: "canonical_sha256",
      reasoning: "Canonical image hash match found in database.",
    };
  }

  // Level 3: Perceptual Hash (pHash / dHash distance)
  if (candidatePhash && newHashes.perceptualHash) {
    const dist = hammingDistance(newHashes.perceptualHash, candidatePhash);

    if (dist <= thresholds.exactPhash) {
      return {
        isDuplicate: true,
        duplicateStatus: "visual_duplicate",
        confidence: 95,
        matchedTemplateId: candidate.id,
        matchMethod: "perceptual_hash",
        reasoning: `Perceptual hash exact match (Hamming distance ${dist}).`,
      };
    }

    if (dist <= thresholds.nearPhash) {
      return {
        isDuplicate: true,
        duplicateStatus: "visual_duplicate",
        confidence: 90,
        matchedTemplateId: candidate.id,
        matchMethod: "perceptual_hash",
        reasoning: `Near visual duplicate detected (Hamming distance ${dist}).`,
      };
    }

    if (dist <= thresholds.possiblePhash) {
      return {
        isDuplicate: true,
        duplicateStatus: "possible_duplicate",
        confidence: 75,
        matchedTemplateId: candidate.id,
        matchMethod: "perceptual_hash",
        reasoning: `Possible visual duplicate detected (Hamming distance ${dist}).`,
      };
    }
  }

  return null;
}
