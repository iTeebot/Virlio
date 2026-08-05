import { z } from "zod";

/**
 * Schema for a single AI-generated meme candidate.
 * The AI selects templates from pre-ranked candidates and writes captions.
 */
export const MemeCandidateSchema = z.object({
  template_id: z.string().uuid(),
  reason_selected: z.string().min(5).max(500),
  title: z.string().max(100).optional().nullable(),
  description: z.string().max(300).optional().nullable(),
  top_text: z.string().max(200).optional().nullable(),
  bottom_text: z.string().max(200).optional().nullable(),
  region_captions: z.record(z.string(), z.string()).optional().nullable(),
  text_layout: z.enum([
    "top_only",
    "bottom_only",
    "top_bottom",
    "top_middle",
    "middle_only",
    "no_text",
    "regions",
  ]),
  confidence: z.number().min(0).max(100),
  tone: z.string().min(1).max(50),
  hashtags: z.array(z.string().max(50)).max(8).default([]),
});

/**
 * Schema for the complete AI meme generation response.
 * Contains 1-4 meme candidates from a single generation batch.
 */
export const MemeGenerationOutputSchema = z.object({
  memes: z.array(MemeCandidateSchema).min(1).max(4),
});

export type MemeCandidate = z.infer<typeof MemeCandidateSchema>;
export type MemeGenerationOutput = z.infer<typeof MemeGenerationOutputSchema>;

/**
 * Individual Region definition with percentage coordinate bounds.
 */
export const RegionBoxSchema = z.object({
  id: z.string(),
  name: z.string(),
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
  width: z.number().min(0).max(100),
  height: z.number().min(0).max(100),
  angle: z.number().optional().default(0),
  fontSizeFactor: z.number().optional().default(1.0),
  description: z.string().optional(),
});

export type RegionBox = z.infer<typeof RegionBoxSchema>;

/**
 * AI Generation Profile schema stored on each template during approval.
 * Used by the ranking engine to match templates to generation requests.
 */
export const AIGenerationProfileSchema = z.object({
  humorType: z.string().default("General"),
  textLayout: z.enum([
    "top_only",
    "bottom_only",
    "top_bottom",
    "top_middle",
    "top_middle_bottom",
    "middle_only",
    "no_text",
    "regions",
    "custom",
  ]).default("top_bottom"),
  regions: z.array(RegionBoxSchema).optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
  memeStyle: z.string().default("Reaction"),
  emotion: z.string().default("Neutral"),
  preferredCaptionLength: z.enum(["short", "medium", "long"]).default("short"),
  requiresKnowledge: z.boolean().default(false),
  sceneDescription: z.string().optional(),
  bestFor: z.array(z.string()).default([]),
});

export type AIGenerationProfile = z.infer<typeof AIGenerationProfileSchema>;
