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

/**
 * Synthesizes a diffusion image for a single brand post variation.
 */
export async function synthesizeVariationImage(
  input: SynthesizeVariationImageInput
): Promise<SynthesizeVariationImageResult> {
  const startTime = Date.now();
  const aspectRatio = input.aspectRatio || "1:1";

  // 1. Synthesize image via capable diffusion model (Flux / Recraft / Imagen 3)
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

  const imageResult = execution.result;
  const latencyMs = Date.now() - startTime;

  // 2. Upload generated image buffer directly to Cloudinary
  const folder = `virlio/brands/${input.brandId}/posts/${input.sessionId}`;
  const uploadResult = await uploadBufferToCloudinary(imageResult.imageBuffer, folder, {
    format: imageResult.format,
    tags: ["brand_post", input.brandId, input.sessionId, input.variationId],
  });

  // 3. Record Cloud Asset in database
  const asset = await cloudAssetRepository.create({
    public_id: uploadResult.public_id,
    secure_url: uploadResult.secure_url,
    width: uploadResult.width || imageResult.width,
    height: uploadResult.height || imageResult.height,
    format: uploadResult.format || imageResult.format,
    bytes: uploadResult.bytes || imageResult.imageBuffer.byteLength,
    version: String(uploadResult.version || "1"),
    folder,
    resource_type: "image",
    entity_type: "brand_post" as any,
    transformation_metadata: {
      aspectRatio,
      provider: execution.provider,
      model: execution.model,
    },
  });

  // 4. Create immutable Image Version 1 record in database
  const version = await brandPostRepository.createImageVersion({
    variation_id: input.variationId,
    parent_version_id: null, // v1 has no parent
    version_number: 1,
    asset_id: asset?.id,
    image_url: uploadResult.secure_url,
    thumbnail_url: uploadResult.secure_url,
    edit_instruction: null,
    full_generation_prompt: input.diffusionPrompt,
    negative_prompt: input.negativePrompt,
    seed: imageResult.seed ?? input.seed,
    aspect_ratio: aspectRatio,
    provider: execution.provider,
    model: execution.model,
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
    providerUsed: execution.provider,
    modelUsed: execution.model,
    generationTimeMs: latencyMs,
  };
}

/**
 * Synthesizes images for all 4 variations concurrently.
 */
export async function synthesizeBatchVariationImages(
  variations: Array<{ variationId: string; diffusionPrompt: string; negativePrompt?: string; seed?: number }>,
  options: { brandId: string; sessionId: string; aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9"; brandColors?: string[] }
): Promise<SynthesizeVariationImageResult[]> {
  const tasks = variations.map((v) =>
    synthesizeVariationImage({
      variationId: v.variationId,
      brandId: options.brandId,
      sessionId: options.sessionId,
      diffusionPrompt: v.diffusionPrompt,
      negativePrompt: v.negativePrompt,
      aspectRatio: options.aspectRatio,
      brandColors: options.brandColors,
      seed: v.seed,
    })
  );

  return Promise.all(tasks);
}
