import { AIProviderFactory, AnalysisPromptInput } from "../providers/provider-factory";
import { computeSha256, computeDHash } from "../utilities/perceptual-hash";
import { TemplateAIOutput } from "../schemas/template-analysis.schema";

export interface TemplateModerationInput {
  imageBuffer?: Buffer;
  imageUrl: string;
  userTitle?: string;
  userCategory?: string;
  userSubcategory?: string;
  userTags?: string[];
  userDescription?: string;
  existingHashes?: { sha256_hash?: string | null; phash?: string | null }[];
}

export interface TemplateModerationWorkflowResult {
  sha256Hash: string;
  phash: string;
  isDuplicate: boolean;
  duplicateScore: number;
  provider: string;
  model: string;
  analysis: TemplateAIOutput;
}

export async function runTemplateModerationWorkflow(
  input: TemplateModerationInput
): Promise<TemplateModerationWorkflowResult> {
  const buffer = input.imageBuffer || Buffer.from("");
  const sha256Hash = computeSha256(buffer);
  const phash = computeDHash(buffer);

  // 1. Fast Duplicate Detection Short-Circuit
  let isDuplicate = false;
  let duplicateScore = 0;

  if (input.existingHashes && input.existingHashes.length > 0) {
    for (const item of input.existingHashes) {
      if (item.sha256_hash && item.sha256_hash === sha256Hash) {
        isDuplicate = true;
        duplicateScore = 100;
        break;
      }
      if (item.phash && item.phash === phash) {
        isDuplicate = true;
        duplicateScore = 95;
        break;
      }
    }
  }

  if (isDuplicate) {
    return {
      sha256Hash,
      phash,
      isDuplicate: true,
      duplicateScore: 100,
      provider: "internal-duplicate-checker",
      model: "virlio-phash-v1",
      analysis: {
        title: input.userTitle || "Duplicate Template Upload",
        description: input.userDescription || "This image matches an existing uploaded template.",
        category: input.userCategory || "General",
        subcategory: input.userSubcategory || "General",
        tags: input.userTags || ["duplicate"],
        language: "en",
        country: "Global",
        qualityScore: 70,
        riskScore: 0,
        duplicateScore: 100,
        confidenceScore: 99,
        ocrText: "",
        safetyClassification: "SAFE",
        moderationDecision: "DUPLICATE",
        reasoning: "Exact visual duplicate or identical file hash detected in the database.",
      },
    };
  }

  // 2. AI Multi-Provider Vision & Moderation Analysis
  const aiPromptInput: AnalysisPromptInput = {
    imageUrl: input.imageUrl,
    userTitle: input.userTitle,
    userCategory: input.userCategory,
    userSubcategory: input.userSubcategory,
    userTags: input.userTags,
    userDescription: input.userDescription,
  };

  const { result: analysis, provider, model } = await AIProviderFactory.analyzeTemplateWithFallback(aiPromptInput);

  return {
    sha256Hash,
    phash,
    isDuplicate: false,
    duplicateScore: analysis.duplicateScore || 0,
    provider,
    model,
    analysis,
  };
}
