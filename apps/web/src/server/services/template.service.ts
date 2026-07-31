import { templateRepository, userRepository } from "../repositories";
import { runTemplateModerationWorkflow } from "@virlio/ai";
import { validateImageBuffer } from "@/lib/utils/image-validation";
import { validateCategoryContent } from "@/lib/utils/explicit-content-filter";
import { uploadBufferToCloudinary, deleteCloudinaryAsset } from "@/lib/cloudinary/upload";
import { slugify } from "@virlio/utils";
import type { Template } from "@virlio/database/types";

export interface TemplateUploadInput {
  buffer: Buffer;
  fileName?: string;
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  country?: string;
  language?: string;
  tags?: string[];
  originalSource?: string;
  license?: string;
}

function sanitizePathSegment(segment: string): string {
  if (!segment) return "general";
  return segment
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "") || "general";
}

export async function processTemplateUpload(userId: string, input: TemplateUploadInput) {
  // 1. Fetch User Record to verify authentic username
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("Authenticated user not found");

  const rawUsername = user.username || `user_${userId.substring(0, 8)}`;
  const sanitizedUsername = sanitizePathSegment(rawUsername);

  // 1b. Explicit Category Content Filter
  if (input.category) {
    const categoryCheck = validateCategoryContent(input.category);
    if (categoryCheck.isExplicit) {
      throw new Error(categoryCheck.reason || "Category contains inappropriate or adult-restricted language.");
    }
  }

  if (input.subcategory) {
    const subcategoryCheck = validateCategoryContent(input.subcategory);
    if (subcategoryCheck.isExplicit) {
      throw new Error(subcategoryCheck.reason || "Subcategory contains inappropriate or adult-restricted language.");
    }
  }

  // 2. Server-side Binary Validation
  const validation = validateImageBuffer(input.buffer, undefined, input.fileName);
  if (!validation.valid) {
    throw new Error(validation.error || "Invalid image file");
  }

  // 3. Existing Hashes for Duplicate Detection
  const existingHashes = await templateRepository.findExistingHashes();

  // 4. Temporary Cloudinary Upload for AI Inspection
  const tempFolder = `${sanitizedUsername}/templates/processing`;
  const tempUpload = await uploadBufferToCloudinary(input.buffer, tempFolder);
  const imageUrl = tempUpload.secure_url;

  let finalCloudinaryResult = tempUpload;

  try {
    // 5. Execute AI Vision, OCR, Moderation & Taxonomy Workflow
    const moderationResult = await runTemplateModerationWorkflow({
      imageBuffer: input.buffer,
      imageUrl,
      userTitle: input.title,
      userCategory: input.category,
      userSubcategory: input.subcategory,
      userTags: input.tags,
      userDescription: input.description,
      existingHashes,
    });

    const { analysis, sha256Hash, phash, isDuplicate, provider, model } = moderationResult;

    // 6. Determine final Category & Subcategory taxonomy
    const finalCategory = sanitizePathSegment(analysis.category || input.category || "General");
    const finalSubcategory = sanitizePathSegment(analysis.subcategory || input.subcategory || "General");
    const baseTitle = analysis.title || input.title || "Untitled Meme Template";
    const templateSlug = `${slugify(baseTitle)}-${Date.now().toString(36)}`;
    const sanitizedFilename = sanitizePathSegment(templateSlug);

    // 7. Relocate / Re-upload asset to final required Cloudinary folder path
    // Format: username/templates/:category/:subcategory/:filename
    const finalFolder = `${sanitizedUsername}/templates/${finalCategory}/${finalSubcategory}`;
    
    try {
      finalCloudinaryResult = await uploadBufferToCloudinary(input.buffer, finalFolder, {
        public_id: sanitizedFilename,
      });
      // Cleanup temporary upload asset
      await deleteCloudinaryAsset(tempUpload.public_id).catch(() => null);
    } catch (relocateErr) {
      console.warn("Cloudinary final relocation warning, retaining original upload:", relocateErr);
    }

    // 8. Map Publication & Moderation Decision
    let moderationStatus: "approved" | "rejected" | "flagged" = "approved";
    let visibility: "public" | "private" | "unlisted" = "public";
    let processingStatus = "APPROVED";

    if (analysis.moderationDecision === "REJECTED" || analysis.riskScore > 50) {
      moderationStatus = "rejected";
      visibility = "private";
      processingStatus = "REJECTED";
    } else if (analysis.moderationDecision === "NEEDS_REVIEW" || analysis.safetyClassification === "BORDERLINE") {
      moderationStatus = "flagged";
      visibility = "private";
      processingStatus = "NEEDS_REVIEW";
    } else if (isDuplicate || analysis.moderationDecision === "DUPLICATE") {
      moderationStatus = "flagged";
      visibility = "private";
      processingStatus = "DUPLICATE";
    }

    // 9. Persist DB Template Record directly from AI Analyzed Metadata
    const templateRecord = await templateRepository.create({
      title: baseTitle,
      slug: templateSlug,
      description: analysis.description || input.description || null,
      category: analysis.category || input.category || "General",
      subcategory: analysis.subcategory || input.subcategory || "General",
      language: analysis.language || input.language || "any",
      country: analysis.country || input.country || "Global",
      tags: analysis.tags && analysis.tags.length > 0 ? analysis.tags : (input.tags || []),
      visibility,
      moderation_status: moderationStatus,
      approval_confidence: analysis.confidenceScore || 90,
      approval_metadata: {
        safetyClassification: analysis.safetyClassification,
        reasoning: analysis.reasoning,
        ocrText: analysis.ocrText,
        aiGeneratedTitle: analysis.title,
        aiGeneratedCategory: analysis.category,
        aiGeneratedTags: analysis.tags,
      },
      original_source: input.originalSource || null,
      license: input.license || "Standard License",
      ai_summary: analysis.description || null,
      ai_tags: analysis.tags || [],
      duplicate_group: isDuplicate ? sha256Hash : null,
      cloudinary_public_id: finalCloudinaryResult.public_id,
      cloudinary_secure_url: finalCloudinaryResult.secure_url,
      image_width: finalCloudinaryResult.width || validation.width || 800,
      image_height: finalCloudinaryResult.height || validation.height || 600,
      image_format: finalCloudinaryResult.format || validation.extension || "png",
      image_bytes: finalCloudinaryResult.bytes || validation.bytes || 0,
      sha256_hash: sha256Hash,
      phash,
      dhash: phash,
      ocr_text: analysis.ocrText || null,
      ocr_confidence: analysis.confidenceScore || 90,
      ocr_language: analysis.language || "any",
      quality_score: analysis.qualityScore || 80,
      risk_score: analysis.riskScore || 0,
      duplicate_score: analysis.duplicateScore || (isDuplicate ? 100 : 0),
      processing_status: processingStatus,
      rejection_reason: processingStatus === "REJECTED" ? analysis.reasoning : null,
      uploaded_by: userId,
      created_by: userId,
      updated_by: userId,
    });

    // 10. Persist Moderation Audit Log
    await templateRepository.recordModerationLog({
      template_id: templateRecord.id,
      provider,
      model,
      moderation_decision: processingStatus,
      confidence_score: analysis.confidenceScore || 90,
      quality_score: analysis.qualityScore || 80,
      risk_score: analysis.riskScore || 0,
      duplicate_score: analysis.duplicateScore || (isDuplicate ? 100 : 0),
      reasoning: analysis.reasoning,
      raw_ai_response: analysis,
    });

    // 11. Persist Cloud Asset Record
    await templateRepository.recordCloudAsset({
      public_id: finalCloudinaryResult.public_id,
      secure_url: finalCloudinaryResult.secure_url,
      width: finalCloudinaryResult.width,
      height: finalCloudinaryResult.height,
      format: finalCloudinaryResult.format,
      bytes: finalCloudinaryResult.bytes,
      folder: finalFolder,
      owner_id: userId,
      entity_id: templateRecord.id,
    });

    // 12. Record Activity Log
    await templateRepository.recordActivity({
      user_id: userId,
      activity_type: moderationStatus === "approved" ? "template_approved" : "template_uploaded",
      entity_id: templateRecord.id,
      metadata: { title: baseTitle, category: finalCategory, status: processingStatus },
    });

    return {
      template: templateRecord,
      analysis,
      moderationStatus,
      processingStatus,
      isDuplicate,
      cloudinaryUrl: finalCloudinaryResult.secure_url,
      cloudinaryPath: `${finalFolder}/${sanitizedFilename}`,
      contributorUsername: user.username || sanitizedUsername,
    };
  } catch (err: any) {
    // Cleanup temporary upload if an unexpected crash occurs
    await deleteCloudinaryAsset(tempUpload.public_id).catch(() => null);
    throw err;
  }
}

export async function upload(userId: string, data: Partial<Template>) {
  return templateRepository.create({ ...data, uploaded_by: userId } as any);
}

export async function update(templateId: string, userId: string, data: Partial<Template>) {
  const template = await templateRepository.findById(templateId);
  if (!template || template.uploaded_by !== userId) throw new Error("Unauthorized");
  return templateRepository.update(templateId, data);
}

export async function getBySlug(slug: string) {
  return templateRepository.findBySlug(slug);
}

export async function getByCategory(category: string, options: { limit?: number; offset?: number } = {}) {
  return templateRepository.findByCategory(category, options);
}

export async function getPublicTemplates(options: { limit?: number; offset?: number } = {}) {
  return templateRepository.findPublicTemplates(options);
}

export async function getContributorTemplates(userId: string, options: { limit?: number; offset?: number } = {}) {
  return templateRepository.findByContributor(userId, options);
}

export async function search(query: string, options: { limit?: number; offset?: number } = {}) {
  return templateRepository.search(query, options);
}
