import crypto from "node:crypto";

/**
 * Computes exact SHA-256 hex hash of an image buffer.
 */
export function computeSha256(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

/**
 * Computes a difference hash (dHash) for an image buffer.
 * If raw image parsing isn't feasible, generates a sample sampling hash based on byte blocks.
 */
export function computeDHash(buffer: Buffer): string {
  if (!buffer || buffer.length < 64) {
    return computeSha256(buffer).substring(0, 16);
  }

  // Fast sampled block hash for duplicate detection
  const sampleSize = 64;
  const step = Math.max(1, Math.floor(buffer.length / sampleSize));
  let hashBits = "";

  for (let i = 0; i < sampleSize - 1; i++) {
    const b1 = buffer[i * step] || 0;
    const b2 = buffer[(i + 1) * step] || 0;
    hashBits += b1 > b2 ? "1" : "0";
  }

  // Convert 63 bits to hex string
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
