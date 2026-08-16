import { z } from "zod";

export const createPostSessionSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  focus_type: z.enum(["product", "service", "general", "campaign"]).default("general"),
  selected_product: z.string().max(100).optional().nullable(),
  selected_service: z.string().max(100).optional().nullable(),
  target_platform: z.enum(["instagram_feed", "linkedin", "x", "story"]).default("instagram_feed"),
  aspect_ratio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
});

export const generatePostBatchSchema = z.object({
  session_id: z.string().uuid("Invalid session ID"),
  user_prompt: z.string().min(3, "Prompt must be at least 3 characters").max(1000),
  campaign_goal: z.string().max(200).optional().nullable(),
  target_audience: z.string().max(200).optional().nullable(),
  target_platform: z.enum(["instagram_feed", "linkedin", "x", "story"]).default("instagram_feed"),
  aspect_ratio: z.enum(["1:1", "4:5", "9:16", "16:9"]).default("1:1"),
  tone_override: z.string().max(100).optional().nullable(),
  selected_product: z.string().max(100).optional().nullable(),
  selected_service: z.string().max(100).optional().nullable(),
  auto_synthesize_images: z.boolean().default(true),
});

export const editImageVersionSchema = z.object({
  parent_version_id: z.string().uuid("Invalid parent version ID"),
  edit_instruction: z.string().min(3, "Edit instruction must be at least 3 characters").max(500),
  aspect_ratio: z.enum(["1:1", "4:5", "9:16", "16:9"]).optional(),
  preserved_elements: z.array(z.string().max(100)).max(10).optional(),
});

export const approveVariationSchema = z.object({
  is_approved: z.boolean().default(true),
});
