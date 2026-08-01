import { AIProviderFactory, AnalysisPromptInput } from "../providers/provider-factory";
import {
  computeSha256,
  computeCanonicalImageHash,
  computeDHash,
  evaluateDuplicateCandidate,
  DuplicateCheckResult,
} from "../utilities/perceptual-hash";
import { TemplateAIOutput } from "../schemas/template-analysis.schema";

export interface CandidateTemplate {
  id: string;
  original_sha256?: string | null;
  canonical_image_sha256?: string | null;
  perceptual_hash?: string | null;
  sha256_hash?: string | null;
  phash?: string | null;
}

export interface TemplateModerationInput {
  imageBuffer?: Buffer;
  imageUrl: string;
  userTitleHint?: string;
  userCategoryHint?: string;
  userSubcategoryHint?: string;
  userTagsHint?: string[];
  userDescriptionHint?: string;
  userLanguageHint?: string;
  userCountryHint?: string;
  existingCandidates?: CandidateTemplate[];
  // Backwards compatibility aliases
  userTitle?: string;
  userCategory?: string;
  userSubcategory?: string;
  userTags?: string[];
  userDescription?: string;
  existingHashes?: any[];
}

export interface TemplateModerationWorkflowResult {
  originalSha256: string;
  canonicalSha256: string;
  perceptualHash: string;
  sha256Hash: string;
  phash: string;
  isDuplicate: boolean;
  duplicateScore: number;
  duplicateResult: DuplicateCheckResult | null;
  provider: string;
  model: string;
  analysis: TemplateAIOutput;
}

export async function runTemplateModerationWorkflow(
  input: TemplateModerationInput
): Promise<TemplateModerationWorkflowResult> {
  const buffer = input.imageBuffer || Buffer.from("");
  const originalSha256 = computeSha256(buffer);
  const canonicalSha256 = await computeCanonicalImageHash(buffer);
  const perceptualHash = computeDHash(buffer);

  // Backwards compatible aliases
  const sha256Hash = originalSha256;
  const phash = perceptualHash;

  const candidates: CandidateTemplate[] = input.existingCandidates || input.existingHashes || [];

  // 1. Layered Duplicate Detection Check (Levels 1 - 3)
  let duplicateResult: DuplicateCheckResult | null = null;
  for (const candidate of candidates) {
    const evalResult = evaluateDuplicateCandidate(
      { originalSha256, canonicalSha256, perceptualHash },
      candidate
    );
    if (evalResult && evalResult.isDuplicate) {
      duplicateResult = evalResult;
      break;
    }
  }

  if (duplicateResult && duplicateResult.isDuplicate) {
    return {
      originalSha256,
      canonicalSha256,
      perceptualHash,
      sha256Hash,
      phash,
      isDuplicate: true,
      duplicateScore: duplicateResult.confidence,
      duplicateResult,
      provider: "internal-duplicate-checker",
      model: "virlio-fingerprint-v1",
      analysis: {
        title: input.userTitleHint || input.userTitle || "Duplicate Template Upload",
        description: input.userDescriptionHint || input.userDescription || "This image matches an existing template on Virlio.",
        category: input.userCategoryHint || input.userCategory || "General",
        subcategory: input.userSubcategoryHint || input.userSubcategory || "General",
        tags: input.userTagsHint || input.userTags || ["duplicate"],
        language: input.userLanguageHint || "en",
        country: input.userCountryHint || "Global",
        qualityScore: 70,
        riskScore: 0,
        duplicateScore: duplicateResult.confidence,
        confidenceScore: 99,
        ocrText: "",
        safetyClassification: "SAFE",
        moderationDecision: "DUPLICATE",
        reasoning: duplicateResult.reasoning || "Exact visual duplicate or identical image fingerprint detected.",
      },
    };
  }

  // 2. AI Multi-Provider Vision & Moderation Analysis
  const aiPromptInput: AnalysisPromptInput = {
    imageUrl: input.imageUrl,
    userTitle: input.userTitleHint || input.userTitle,
    userCategory: input.userCategoryHint || input.userCategory,
    userSubcategory: input.userSubcategoryHint || input.userSubcategory,
    userTags: input.userTagsHint || input.userTags,
    userDescription: input.userDescriptionHint || input.userDescription,
  };

  const { result: analysis, provider, model } = await AIProviderFactory.analyzeTemplateWithFallback(aiPromptInput);

  return {
    originalSha256,
    canonicalSha256,
    perceptualHash,
    sha256Hash,
    phash,
    isDuplicate: false,
    duplicateScore: analysis.duplicateScore || 0,
    duplicateResult: null,
    provider,
    model,
    analysis,
  };
}
