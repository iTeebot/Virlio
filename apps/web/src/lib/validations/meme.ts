import { z } from "zod";
import { uuidSchema } from "./common";

export const generateMemeSchema = z.object({
  brand_id: uuidSchema,
  template_id: uuidSchema.optional(),
  prompt: z.string().min(1).max(500),
  visibility: z.enum(["public", "private", "unlisted"]).default("public"),
});

export const updateMemeSchema = z.object({
  generated_caption: z.string().max(1000).optional(),
  generated_hashtags: z.array(z.string()).max(20).optional(),
  visibility: z.enum(["public", "private", "unlisted"]).optional(),
  social_urls: z.array(z.string().url()).optional(),
});

export const generateMemeBatchSchema = z.object({
  brand_id: uuidSchema,
  topic: z.string().min(1).max(500),
  campaign_name: z.string().max(200).optional().nullable(),
  target_audience: z.string().max(500).optional().nullable(),
  marketing_goal: z.string().max(200).optional().nullable(),
  tone: z.string().max(100).optional().nullable(),
  cta: z.string().max(200).optional().nullable(),
  additional_notes: z.string().max(1000).optional().nullable(),
  count: z.number().min(1).max(4).default(4),
});
