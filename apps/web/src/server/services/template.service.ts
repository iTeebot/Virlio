import { templateRepository, userRepository } from "../repositories";
import {
  runTemplateModerationWorkflow,
  computeSha256,
  computeCanonicalImageHash,
  computeDHash,
} from "@virlio/ai";
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
  // 1. Authentication Check & User Fetch
  const user = await userRepository.findById(userId);
  if (!user) throw new Error("Authenticated user not found");

  const rawUsername = user.username || `user_${userId.substring(0, 8)}`;
  const sanitizedUsername = sanitizePathSegment(rawUsername);

  // 1b. Explicit Category Content Filter on User Hints
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

  // 3 & 4 & 5. Layered Image Fingerprint Calculations (Level 1, 2, 3)
  const originalSha256 = computeSha256(input.buffer);
  const canonicalSha256 = await computeCanonicalImageHash(input.buffer);
  const perceptualHash = computeDHash(input.buffer);

  // 6. Level 1 & Level 2 Indexed Duplicate Short-Circuit
  const existingOriginalMatch = await templateRepository.findByOriginalSha256(originalSha256);
  const existingCanonicalMatch = !existingOriginalMatch
    ? await templateRepository.findByCanonicalSha256(canonicalSha256)
    : null;
  const exactDuplicateMatch = existingOriginalMatch || existingCanonicalMatch;

  if (exactDuplicateMatch) {
    // FAST SHORT-CIRCUIT: Exact Duplicate Detected BEFORE expensive AI Vision processing
    const duplicateTitle = input.title || exactDuplicateMatch.title || "Duplicate Meme Template";
    const duplicateSlug = `${slugify(duplicateTitle)}-dup-${Date.now().toString(36)}`;

    const duplicateRecord = await templateRepository.create({
      title: duplicateTitle,
      slug: duplicateSlug,
      description: input.description || exactDuplicateMatch.description || null,
      category: exactDuplicateMatch.category || input.category || "General",
      subcategory: exactDuplicateMatch.subcategory || input.subcategory || "General",
      language: input.language || exactDuplicateMatch.language || "any",
      country: input.country || exactDuplicateMatch.country || "Global",
      tags: input.tags || exactDuplicateMatch.tags || [],
      visibility: "private",
      moderation_status: "flagged",
      approval_confidence: 100,
      approval_metadata: {
        safetyClassification: "SAFE",
        reasoning: "Exact byte-for-byte or canonical image hash duplicate detected in database.",
        matchedOriginalTemplateId: exactDuplicateMatch.id,
        matchedOriginalSlug: exactDuplicateMatch.slug,
      },
      original_source: input.originalSource || null,
      license: input.license || "Standard License",
      ai_summary: exactDuplicateMatch.ai_summary || null,
      ai_tags: exactDuplicateMatch.ai_tags || [],
      duplicate_group: originalSha256,
      sha256_hash: originalSha256,
      cloudinary_public_id: exactDuplicateMatch.cloudinary_public_id || null,
      cloudinary_secure_url: exactDuplicateMatch.cloudinary_secure_url || null,
      image_width: exactDuplicateMatch.image_width || 800,
      image_height: exactDuplicateMatch.image_height || 600,
      image_format: exactDuplicateMatch.image_format || "png",
      image_bytes: exactDuplicateMatch.image_bytes || 0,
      // Fingerprinting fields
      original_sha256: originalSha256,
      canonical_image_sha256: canonicalSha256,
      perceptual_hash: perceptualHash,
      duplicate_status: "exact_duplicate",
      duplicate_of_template_id: exactDuplicateMatch.id,
      duplicate_confidence: 100,
      duplicate_checked_at: new Date(),
      fingerprint_version: "v1",
      // User hints provenance
      user_title_hint: input.title || null,
      user_description_hint: input.description || null,
      user_category_hint: input.category || null,
      user_subcategory_hint: input.subcategory || null,
      user_tags_hint: input.tags || null,
      user_language_hint: input.language || null,
      user_country_hint: input.country || null,
      processing_status: "DUPLICATE",
      rejection_reason: "This exact image has already been uploaded to Virlio.",
      uploaded_by: userId,
      created_by: userId,
      updated_by: userId,
    });

    await templateRepository.recordModerationLog({
      template_id: duplicateRecord.id,
      provider: "internal-duplicate-checker",
      model: "virlio-sha256-v1",
      moderation_decision: "DUPLICATE",
      confidence_score: 100,
      quality_score: exactDuplicateMatch.quality_score || 80,
      risk_score: 0,
      duplicate_score: 100,
      reasoning: `Exact image duplicate of template #${exactDuplicateMatch.id}`,
    });

    return {
      template: duplicateRecord,
      analysis: {
        title: duplicateTitle,
        description: exactDuplicateMatch.description || "Duplicate image submission.",
        category: exactDuplicateMatch.category || "General",
        subcategory: exactDuplicateMatch.subcategory || "General",
        tags: (exactDuplicateMatch.tags as string[]) || [],
        language: "en",
        country: "Global",
        qualityScore: exactDuplicateMatch.quality_score || 80,
        riskScore: 0,
        duplicateScore: 100,
        confidenceScore: 100,
        ocrText: "",
        safetyClassification: "SAFE",
        moderationDecision: "DUPLICATE",
        reasoning: "Exact visual or raw bytes duplicate detected.",
      },
      moderationStatus: "flagged",
      processingStatus: "DUPLICATE",
      isDuplicate: true,
      duplicateStatus: "exact_duplicate",
      duplicateOfTemplateId: exactDuplicateMatch.id,
      existingTemplateSlug: exactDuplicateMatch.slug,
      cloudinaryUrl: exactDuplicateMatch.cloudinary_secure_url || "",
      cloudinaryPath: "",
      contributorUsername: user.username || sanitizedUsername,
    };
  }

  // 7. Fetch Candidate Set for Level 3 Perceptual Hash Check
  const candidateList = await templateRepository.findPerceptualCandidates();

  // 8. Temporary Cloudinary Upload for AI Inspection
  const tempFolder = `${sanitizedUsername}/templates/processing`;
  const tempUpload = await uploadBufferToCloudinary(input.buffer, tempFolder);
  const imageUrl = tempUpload.secure_url;

  let finalCloudinaryResult = tempUpload;

  try {
    // 9. Execute AI Vision, OCR, Moderation & Taxonomy Workflow
    const moderationResult = await runTemplateModerationWorkflow({
      imageBuffer: input.buffer,
      imageUrl,
      userTitleHint: input.title,
      userCategoryHint: input.category,
      userSubcategoryHint: input.subcategory,
      userTagsHint: input.tags,
      userDescriptionHint: input.description,
      userLanguageHint: input.language,
      userCountryHint: input.country,
      existingCandidates: candidateList,
    });

    const { analysis, isDuplicate, duplicateResult, provider, model } = moderationResult;

    // 10. Canonical Metadata Authority: AI output is canonical, user inputs are retained as hints
    const finalCategory = sanitizePathSegment(analysis.category || input.category || "General");
    const finalSubcategory = sanitizePathSegment(analysis.subcategory || input.subcategory || "General");
    const baseTitle = analysis.title || input.title || "Untitled Meme Template";
    const templateSlug = `${slugify(baseTitle)}-${Date.now().toString(36)}`;
    const sanitizedFilename = sanitizePathSegment(templateSlug);

    // 11. Relocate asset to final Cloudinary folder path
    const finalFolder = `${sanitizedUsername}/templates/${finalCategory}/${finalSubcategory}`;

    try {
      finalCloudinaryResult = await uploadBufferToCloudinary(input.buffer, finalFolder, {
        public_id: sanitizedFilename,
      });
      await deleteCloudinaryAsset(tempUpload.public_id).catch(() => null);
    } catch (relocateErr) {
      console.warn("Cloudinary final relocation warning, retaining original upload:", relocateErr);
    }

    // 12. Map Publication & Moderation Decision
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

    const determinedDuplicateStatus = duplicateResult?.duplicateStatus || (isDuplicate ? "visual_duplicate" : "unique");

    // 13. Persist DB Template Record directly from AI Analyzed Metadata
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
      duplicate_group: isDuplicate ? originalSha256 : null,
      cloudinary_public_id: finalCloudinaryResult.public_id,
      cloudinary_secure_url: finalCloudinaryResult.secure_url,
      image_width: finalCloudinaryResult.width || validation.width || 800,
      image_height: finalCloudinaryResult.height || validation.height || 600,
      image_format: finalCloudinaryResult.format || validation.extension || "png",
      image_bytes: finalCloudinaryResult.bytes || validation.bytes || 0,
      sha256_hash: originalSha256,
      phash: perceptualHash,
      dhash: perceptualHash,
      // Layered Fingerprint Storage
      original_sha256: originalSha256,
      canonical_image_sha256: canonicalSha256,
      perceptual_hash: perceptualHash,
      duplicate_status: determinedDuplicateStatus,
      duplicate_of_template_id: duplicateResult?.matchedTemplateId || null,
      duplicate_confidence: duplicateResult?.confidence || (isDuplicate ? 95 : 0),
      duplicate_checked_at: new Date(),
      fingerprint_version: "v1",
      // User Metadata Hints Provenance
      user_title_hint: input.title || null,
      user_description_hint: input.description || null,
      user_category_hint: input.category || null,
      user_subcategory_hint: input.subcategory || null,
      user_tags_hint: input.tags || null,
      user_language_hint: input.language || null,
      user_country_hint: input.country || null,
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

    // 14. Persist Moderation Audit Log
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

    // 15. Persist Cloud Asset Record
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

    // 16. Record Activity Log
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
      duplicateStatus: determinedDuplicateStatus,
      duplicateOfTemplateId: duplicateResult?.matchedTemplateId || null,
      cloudinaryUrl: finalCloudinaryResult.secure_url,
      cloudinaryPath: `${finalFolder}/${sanitizedFilename}`,
      contributorUsername: user.username || sanitizedUsername,
    };
  } catch (err: any) {
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

export async function getPublicTemplates(options: { limit?: number; offset?: number; category?: string } = {}) {
  return templateRepository.findPublicTemplates(options);
}

export async function getContributorTemplates(userId: string, options: { limit?: number; offset?: number } = {}) {
  return templateRepository.findByContributor(userId, options);
}

export async function search(query: string, options: { limit?: number; offset?: number } = {}) {
  return templateRepository.search(query, options);
}
