import fs from "fs";
import path from "path";
import * as brandPostRepository from "../repositories/brand-post.repository";
import * as cloudAssetRepository from "../repositories/cloud-asset.repository";
import { uploadBufferToCloudinary } from "@/lib/cloudinary/upload";
import {
  globalModelRouter,
  FallbackHandler,
  OpenRouterAdapter,
  GroqAdapter,
  MistralAdapter,
  ImageGenerationOptions,
} from "@virlio/ai";

export interface SynthesizeVariationImageInput {
  variationId: string;
  brandId: string;
  sessionId: string;
  diffusionPrompt: string;
  negativePrompt?: string;
  aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9";
  brandColors?: string[];
  brandName?: string;
  conceptTitle?: string;
  headlineText?: string;
  creativeDirection?: string;
  seed?: number;
}

export interface SynthesizeVariationImageResult {
  versionId: string;
  variationId: string;
  assetId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  versionNumber: number;
  providerUsed: string;
  modelUsed: string;
  generationTimeMs: number;
}

const fallbackHandler = new FallbackHandler(globalModelRouter);
fallbackHandler.registerAdapter(new OpenRouterAdapter());
fallbackHandler.registerAdapter(new GroqAdapter());
fallbackHandler.registerAdapter(new MistralAdapter());

async function getSharp() {
  const mod = await import("sharp");
  return mod.default || mod;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Composites the official Virlio watermark icon onto any image buffer.
 */
async function applyVirlioWatermark(imageBuffer: Buffer, width: number = 1024, height: number = 1024): Promise<Buffer> {
  try {
    const sharp = await getSharp();
    const watermarkPath = path.join(process.cwd(), "public/images/watermark.png");

    if (!fs.existsSync(watermarkPath)) {
      return imageBuffer;
    }

    const watermarkSize = Math.max(48, Math.min(80, Math.round(width * 0.08)));
    const watermarkBuffer = fs.readFileSync(watermarkPath);

    const resizedWatermark = await sharp(watermarkBuffer)
      .resize(watermarkSize, watermarkSize)
      .toBuffer();

    const padding = Math.round(width * 0.04);
    const top = height - watermarkSize - padding;
    const left = width - watermarkSize - padding;

    return await sharp(imageBuffer)
      .composite([
        {
          input: resizedWatermark,
          top,
          left,
        },
      ])
      .toBuffer();
  } catch (err) {
    console.warn("[Watermark] Failed to apply watermark overlay:", err);
    return imageBuffer;
  }
}

/**
 * Renders a crisp, solid-color branded visual graphic with typography and watermark.
 * Used as a 100% reliable fallback or standalone visual synthesis engine.
 */
async function renderBrandedVisualFallback(
  input: SynthesizeVariationImageInput,
  width: number = 1024,
  height: number = 1024
): Promise<Buffer> {
  const sharp = await getSharp();
  const primaryColor = input.brandColors?.[0] || "#2563EB";
  const secondaryColor = input.brandColors?.[1] || "#1E40AF";
  const darkBg = input.brandColors?.[3] || "#0F172A";

  const brandName = escapeHtml(input.brandName || "Virlio");
  const headline = escapeHtml(input.headlineText || input.conceptTitle || "Branded Post");
  const direction = escapeHtml(
    (input.creativeDirection || "BRAND POST").replace(/_/g, " ").toUpperCase()
  );

  const svgContent = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Crisp Solid Background (No Gradients) -->
      <rect width="${width}" height="${height}" fill="${darkBg}" />

      <!-- Solid Brand Geometric Accent Blocks -->
      <rect x="40" y="40" width="${width - 80}" height="${height - 80}" rx="24" fill="none" stroke="${primaryColor}" stroke-width="3" opacity="0.3" />
      <rect x="70" y="70" width="120" height="8" rx="4" fill="${primaryColor}" />

      <!-- Category / Direction Badge -->
      <rect x="70" y="110" width="220" height="36" rx="8" fill="${primaryColor}" />
      <text x="180" y="133" fill="#FFFFFF" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-weight="800" font-size="12" letter-spacing="2">${direction}</text>

      <!-- Main Headline in Brand Typography -->
      <text x="70" y="360" fill="#FFFFFF" font-family="system-ui, -apple-system, sans-serif" font-weight="900" font-size="52" style="max-width: 800px;">${headline}</text>

      <!-- Brand Identifier -->
      <text x="70" y="${height - 80}" fill="#94A3B8" font-family="system-ui, -apple-system, sans-serif" font-weight="700" font-size="20">${brandName}</text>
    </svg>
  `;

  const baseBuffer = await sharp(Buffer.from(svgContent)).png().toBuffer();
  return applyVirlioWatermark(baseBuffer, width, height);
}

/**
 * Synthesizes a diffusion image for a single brand post variation.
 */
export async function synthesizeVariationImage(
  input: SynthesizeVariationImageInput
): Promise<SynthesizeVariationImageResult> {
  const startTime = Date.now();
  const aspectRatio = input.aspectRatio || "1:1";
  const width = aspectRatio === "9:16" ? 720 : aspectRatio === "16:9" ? 1280 : 1024;
  const height = aspectRatio === "9:16" ? 1280 : aspectRatio === "16:9" ? 720 : 1024;

  let imageBuffer: Buffer;
  let providerUsed = "virlio_renderer";
  let modelUsed = "solid_brand_compositor";

  try {
    // 1. Attempt AI diffusion synthesis
    const execution = await fallbackHandler.executeWithFallback(
      {
        operation: "IMAGE_GENERATION",
        requiredCapabilities: { requiresImageGeneration: true },
      },
      async (adapter, model) => {
        const genOptions: ImageGenerationOptions = {
          prompt: input.diffusionPrompt,
          negativePrompt: input.negativePrompt || "gradients, blurry, distorted, low quality, cartoonish, clutter",
          aspectRatio,
          seed: input.seed,
          brandColors: input.brandColors,
        };

        return adapter.generateImage(model.modelId, genOptions);
      }
    );

    providerUsed = execution.provider;
    modelUsed = execution.model;
    imageBuffer = await applyVirlioWatermark(execution.result.imageBuffer, width, height);
  } catch (err: any) {
    console.warn(`[Image Synthesis] External diffusion unavailable (${err.message}). Generating high-res branded visual composition with watermark...`);
    imageBuffer = await renderBrandedVisualFallback(input, width, height);
  }

  const latencyMs = Date.now() - startTime;

  // 2. Upload generated image buffer directly to Cloudinary
  const folder = `virlio/brands/${input.brandId}/posts/${input.sessionId}`;
  const uploadResult = await uploadBufferToCloudinary(imageBuffer, folder, {
    format: "png",
    tags: ["brand_post", input.brandId, input.sessionId, input.variationId],
  });

  // 3. Record Cloud Asset in database
  const asset = await cloudAssetRepository.create({
    public_id: uploadResult.public_id,
    secure_url: uploadResult.secure_url,
    width: uploadResult.width || width,
    height: uploadResult.height || height,
    format: uploadResult.format || "png",
    bytes: uploadResult.bytes || imageBuffer.byteLength,
    version: String(uploadResult.version || "1"),
    folder,
    resource_type: "image",
    entity_type: "brand_post" as any,
    transformation_metadata: {
      aspectRatio,
      provider: providerUsed,
      model: modelUsed,
      watermark: "virlio_icon",
    },
  });

  // 4. Create immutable Image Version 1 record in database
  const version = await brandPostRepository.createImageVersion({
    variation_id: input.variationId,
    parent_version_id: null,
    version_number: 1,
    asset_id: asset?.id,
    image_url: uploadResult.secure_url,
    thumbnail_url: uploadResult.secure_url,
    edit_instruction: null,
    full_generation_prompt: input.diffusionPrompt,
    negative_prompt: input.negativePrompt,
    seed: input.seed,
    aspect_ratio: aspectRatio,
    provider: providerUsed,
    model: modelUsed,
    quality_score: 95,
    generation_time_ms: latencyMs,
  });

  if (!version) {
    throw new Error("Failed to create brand post image version record");
  }

  return {
    versionId: version.id,
    variationId: input.variationId,
    assetId: asset.id,
    imageUrl: uploadResult.secure_url,
    thumbnailUrl: uploadResult.secure_url,
    versionNumber: 1,
    providerUsed,
    modelUsed,
    generationTimeMs: latencyMs,
  };
}

/**
 * Synthesizes images for all 4 variations concurrently.
 */
export async function synthesizeBatchVariationImages(
  variations: Array<{
    variationId: string;
    diffusionPrompt: string;
    negativePrompt?: string;
    conceptTitle?: string;
    headlineText?: string;
    creativeDirection?: string;
    seed?: number;
  }>,
  options: {
    brandId: string;
    brandName?: string;
    sessionId: string;
    aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9";
    brandColors?: string[];
  }
): Promise<SynthesizeVariationImageResult[]> {
  const tasks = variations.map((v) =>
    synthesizeVariationImage({
      variationId: v.variationId,
      brandId: options.brandId,
      brandName: options.brandName,
      sessionId: options.sessionId,
      diffusionPrompt: v.diffusionPrompt,
      negativePrompt: v.negativePrompt,
      conceptTitle: v.conceptTitle,
      headlineText: v.headlineText,
      creativeDirection: v.creativeDirection,
      aspectRatio: options.aspectRatio,
      brandColors: options.brandColors,
      seed: v.seed,
    })
  );

  return Promise.all(tasks);
}
