import { brandPostRepository, cloudAssetRepository } from "@/server/repositories";
import { uploadBufferToCloudinary } from "@/lib/cloudinary/upload";
import { getBrandVisualProfile } from "./brand-visual-profile.service";
import {
  globalModelRouter,
  FallbackHandler,
  OpenRouterAdapter,
  GroqAdapter,
  MistralAdapter,
  buildImageEditPrompt,
  ImageEditingOptions,
} from "@virlio/ai";

export interface EditVariationImageInput {
  variationId: string;
  parentVersionId: string;
  editInstruction: string;
  brandId: string;
  sessionId: string;
  preservedElements?: string[];
  aspectRatio?: "1:1" | "4:5" | "9:16" | "16:9";
  maskImageUrl?: string;
}

export interface EditVariationImageResult {
  versionId: string;
  variationId: string;
  parentVersionId: string;
  versionNumber: number;
  assetId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  editInstruction: string;
  providerUsed: string;
  modelUsed: string;
  generationTimeMs: number;
}

const fallbackHandler = new FallbackHandler(globalModelRouter);
fallbackHandler.registerAdapter(new OpenRouterAdapter());
fallbackHandler.registerAdapter(new GroqAdapter());
fallbackHandler.registerAdapter(new MistralAdapter());

/**
 * Executes a precision image edit on an existing image version, preserving brand identity
 * and creating an immutable version node in the revision tree.
 */
export async function editVariationImage(
  input: EditVariationImageInput
): Promise<EditVariationImageResult> {
  const startTime = Date.now();

  // 1. Fetch parent version record
  const parentVersion = await brandPostRepository.findImageVersionById(input.parentVersionId);
  if (!parentVersion) {
    throw new Error(`Parent image version not found: ${input.parentVersionId}`);
  }

  // 2. Fetch brand visual profile for color & styling preservation
  const visualProfile = await getBrandVisualProfile(input.brandId);

  // 3. Formulate precision editing prompt with strict preservation locks
  const defaultPreserved = [
    "exact product geometry, materials, and textures",
    "official brand logo placement and visibility",
    "brand typography and headline text contents",
    "clean solid surface rendering (NO GRADIENTS)",
  ];

  const editPrompt = buildImageEditPrompt({
    editInstruction: input.editInstruction,
    preservedElements: input.preservedElements || defaultPreserved,
    brandColors: [
      visualProfile.colors.primary,
      visualProfile.colors.secondary,
      visualProfile.colors.accent,
      visualProfile.colors.darkBackground,
    ],
    brandName: visualProfile.brandName,
    sourcePrompt: parentVersion.full_generation_prompt,
  });

  // 4. Call AI Image Editing Engine (Recraft v3 / Imagen 3)
  const execution = await fallbackHandler.executeWithFallback(
    {
      operation: "IMAGE_EDITING",
      requiredCapabilities: { requiresImageEditing: true },
    },
    async (adapter, model) => {
      const editOptions: ImageEditingOptions = {
        sourceImageUrl: parentVersion.image_url,
        maskImageUrl: input.maskImageUrl,
        editInstruction: editPrompt,
        preservedElements: input.preservedElements || defaultPreserved,
        aspectRatio: (input.aspectRatio || parentVersion.aspect_ratio || "1:1") as any,
      };

      return adapter.editImage(model.modelId, editOptions);
    }
  );

  const editResult = execution.result;
  const latencyMs = Date.now() - startTime;

  // 5. Upload edited image to Cloudinary
  const folder = `virlio/brands/${input.brandId}/posts/${input.sessionId}/edits`;
  const uploadResult = await uploadBufferToCloudinary(editResult.imageBuffer, folder, {
    format: editResult.format,
    tags: ["brand_post_edit", input.brandId, input.sessionId, input.variationId],
  });

  // 6. Record Cloud Asset in database
  const asset = await cloudAssetRepository.create({
    public_id: uploadResult.public_id,
    secure_url: uploadResult.secure_url,
    width: uploadResult.width || editResult.width,
    height: uploadResult.height || editResult.height,
    format: uploadResult.format || editResult.format,
    bytes: uploadResult.bytes || editResult.imageBuffer.byteLength,
    version: String(uploadResult.version || "1"),
    folder,
    resource_type: "image",
    entity_type: "brand_post" as any,
    transformation_metadata: {
      parentVersionId: input.parentVersionId,
      editInstruction: input.editInstruction,
      provider: execution.provider,
      model: execution.model,
    },
  });

  // 7. Compute next version number in sequence
  const latestNum = await brandPostRepository.getLatestVersionNumber(input.variationId);
  const nextVersionNumber = latestNum + 1;

  // 8. Create immutable new Image Version node in database
  const newVersion = await brandPostRepository.createImageVersion({
    variation_id: input.variationId,
    parent_version_id: input.parentVersionId,
    version_number: nextVersionNumber,
    asset_id: asset?.id,
    image_url: uploadResult.secure_url,
    thumbnail_url: uploadResult.secure_url,
    edit_instruction: input.editInstruction,
    full_generation_prompt: editPrompt,
    negative_prompt: parentVersion.negative_prompt,
    aspect_ratio: input.aspectRatio || parentVersion.aspect_ratio,
    provider: execution.provider,
    model: execution.model,
    quality_score: 95,
    generation_time_ms: latencyMs,
  });

  if (!newVersion) {
    throw new Error("Failed to create edited image version record");
  }

  // 9. Record memory entry for this creative edit
  await brandPostRepository.upsertMemory(
    input.sessionId,
    input.brandId,
    `edit_decision_v${nextVersionNumber}`,
    {
      memoryType: "creative_decision",
      content: `Version ${nextVersionNumber} revision: "${input.editInstruction}" (Parent: v${parentVersion.version_number})`,
      structuredData: {
        versionNumber: nextVersionNumber,
        parentVersionId: input.parentVersionId,
        editInstruction: input.editInstruction,
      },
      importanceScore: 7,
    }
  );

  return {
    versionId: newVersion.id,
    variationId: input.variationId,
    parentVersionId: input.parentVersionId,
    versionNumber: nextVersionNumber,
    assetId: asset.id,
    imageUrl: uploadResult.secure_url,
    thumbnailUrl: uploadResult.secure_url,
    editInstruction: input.editInstruction,
    providerUsed: execution.provider,
    modelUsed: execution.model,
    generationTimeMs: latencyMs,
  };
}
