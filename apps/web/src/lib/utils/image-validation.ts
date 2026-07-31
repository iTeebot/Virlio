export interface ImageValidationResult {
  valid: boolean;
  mimeType?: string;
  extension?: string;
  error?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_MEGAPIXELS = 50; // 50 Megapixels max to prevent pixel bomb attacks

export function validateImageBuffer(buffer: Buffer, clientMimeType?: string, fileName?: string): ImageValidationResult {
  if (!buffer || buffer.length === 0) {
    return { valid: false, error: "Empty or missing file buffer" };
  }

  if (buffer.length > MAX_FILE_SIZE) {
    return { valid: false, error: "File size exceeds 10MB limit" };
  }

  const headerHex = buffer.subarray(0, 16).toString("hex").toUpperCase();
  const headerText = buffer.subarray(0, 100).toString("utf-8").toLowerCase();

  // Reject SVG, HTML, or executable scripts
  if (
    headerText.includes("<svg") ||
    headerText.includes("<?xml") ||
    headerText.includes("<!doctype html") ||
    headerText.includes("<html") ||
    headerText.includes("<script") ||
    headerText.includes("<?php")
  ) {
    return { valid: false, error: "Executable, SVG, or HTML files are strictly rejected" };
  }

  let detectedMime = "";
  let ext = "";

  // Check Magic Bytes
  if (headerHex.startsWith("FFD8FF")) {
    detectedMime = "image/jpeg";
    ext = "jpg";
  } else if (headerHex.startsWith("89504E470D0A1A0A")) {
    detectedMime = "image/png";
    ext = "png";
  } else if (headerHex.startsWith("52494646") && buffer.subarray(8, 12).toString("utf-8") === "WEBP") {
    detectedMime = "image/webp";
    ext = "webp";
  } else if (headerText.includes("ftypavif") || headerText.includes("ftypavis") || headerText.includes("ftypmif1")) {
    detectedMime = "image/avif";
    ext = "avif";
  } else {
    return { valid: false, error: "Unsupported image format or invalid magic bytes. Only JPEG, PNG, WEBP, and AVIF are supported." };
  }

  // Verify file extension if filename is provided
  if (fileName) {
    const fileExt = fileName.split(".").pop()?.toLowerCase();
    if (fileExt) {
      const allowedExts = ["jpg", "jpeg", "png", "webp", "avif"];
      if (!allowedExts.includes(fileExt)) {
        return { valid: false, error: `Invalid file extension .${fileExt}` };
      }
    }
  }

  // Estimate or inspect dimensions from headers
  const dimensions = parseImageDimensions(buffer, detectedMime);
  if (dimensions) {
    const megaPixels = (dimensions.width * dimensions.height) / 1_000_000;
    if (megaPixels > MAX_MEGAPIXELS) {
      return { valid: false, error: `Image dimensions (${dimensions.width}x${dimensions.height}) exceed maximum allowed pixel count` };
    }
  }

  return {
    valid: true,
    mimeType: detectedMime,
    extension: ext,
    bytes: buffer.length,
    width: dimensions?.width || 800,
    height: dimensions?.height || 600,
  };
}

function parseImageDimensions(buffer: Buffer, mime: string): { width: number; height: number } | null {
  try {
    if (mime === "image/png" && buffer.length > 24) {
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }
    if (mime === "image/jpeg" && buffer.length > 2) {
      let offset = 2;
      while (offset < buffer.length - 8) {
        const marker = buffer.readUInt16BE(offset);
        if (marker >= 0xffc0 && marker <= 0xffc3) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        offset += 2 + buffer.readUInt16BE(offset + 2);
      }
    }
  } catch (err) {
    // Fallback if parsing headers fails
  }
  return null;
}
