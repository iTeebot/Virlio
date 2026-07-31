import { z } from "zod";

export const TemplateAIOutputSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(1000).default(""),
  category: z.string().default("General"),
  subcategory: z.string().default("General"),
  tags: z.array(z.string()).default([]),
  language: z.string().default("en"),
  country: z.string().default("Global"),
  qualityScore: z.number().min(0).max(100).default(80),
  riskScore: z.number().min(0).max(100).default(0),
  duplicateScore: z.number().min(0).max(100).default(0),
  confidenceScore: z.number().min(0).max(100).default(90),
  ocrText: z.string().default(""),
  safetyClassification: z.enum(["SAFE", "BORDERLINE", "UNSAFE", "COPYRIGHT_RISK"]).default("SAFE"),
  moderationDecision: z.enum(["APPROVED", "REJECTED", "NEEDS_REVIEW", "DUPLICATE"]).default("APPROVED"),
  reasoning: z.string().default("Template successfully analyzed and verified."),
});

export type TemplateAIOutput = z.infer<typeof TemplateAIOutputSchema>;
