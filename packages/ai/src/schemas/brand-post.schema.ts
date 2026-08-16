import { z } from "zod";

/**
 * 1. Brand Visual Profile Schema
 */
export const BrandVisualProfileSchema = z.object({
  brandId: z.string().uuid(),
  brandName: z.string().min(1),
  industry: z.string().default("General"),
  subIndustry: z.string().optional(),
  businessType: z.enum(["product", "service", "hybrid", "general"]).default("general"),
  colors: z.object({
    primary: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be valid hex code"),
    secondary: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be valid hex code"),
    accent: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be valid hex code"),
    darkBackground: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be valid hex code"),
    lightBackground: z.string().regex(/^#([0-9A-F]{3}){1,2}$/i, "Must be valid hex code"),
    paletteUsageRule: z.string().default("Use crisp solid colors with high contrast. NEVER use CSS gradients."),
  }),
  typography: z.object({
    fontFamily: z.string().default("Inter"),
    style: z.string().default("Modern Sans"),
  }),
  logo: z.object({
    url: z.string().nullable().optional(),
    publicId: z.string().nullable().optional(),
    usageRule: z.string().default("Place logo in top-left with generous margin"),
  }),
  visualStyle: z.object({
    stylePreset: z.string().default("Modern Minimalist"),
    photographyStyle: z.string().default("Studio lighting, clean solid backdrop, crisp shadows"),
    compositionPreference: z.string().default("Generous negative space, bold focal point"),
    toneOfVoice: z.string().default("Friendly & Informative"),
    prohibitedStyles: z.array(z.string()).default(["gradients", "neon glow", "clutter", "cartoonish"]),
    prohibitedColors: z.array(z.string()).default([]),
  }),
  catalog: z.object({
    hasProducts: z.boolean().default(false),
    hasServices: z.boolean().default(false),
    products: z.array(z.string()).default([]),
    services: z.array(z.string()).default([]),
    featuredOfferings: z.array(z.string()).default([]),
    usps: z.array(z.string()).default([]),
    targetAudience: z.string().optional(),
  }),
});

export type BrandVisualProfile = z.infer<typeof BrandVisualProfileSchema>;

/**
 * 2. Creative Variation Concept Schema (Single Variation)
 */
export const BrandPostConceptVariationSchema = z.object({
  variation_index: z.number().int().min(1).max(4),
  creative_direction: z.enum(["product_hero", "lifestyle", "editorial", "bold_social"]),
  direction_label: z.string().min(3).max(60), // e.g. "Studio Product Hero", "Everyday In-Situ Lifestyle"
  concept_title: z.string().min(3).max(100),
  concept_description: z.string().min(10).max(500),
  visual_scene_description: z.string().min(20).max(800), // Detailed scene for diffusion prompt
  diffusion_prompt: z.string().min(20).max(1000),         // Optimized text-to-image prompt
  negative_prompt: z.string().max(500).default("gradients, blurry, low resolution, distorted text, cluttered, neon oversaturation"),
  headline_text: z.string().max(120).optional().nullable(),
  body_copy: z.string().max(300).optional().nullable(),
  caption_copy: z.string().max(600).optional().nullable(),
  hashtags: z.array(z.string().max(50)).max(8).default([]),
  suggested_layout: z.enum(["center_hero", "split_left_text", "split_right_text", "minimal_bottom_text", "clean_visual_only"]).default("center_hero"),
  color_accents_used: z.array(z.string()).max(4).default([]),
});

export type BrandPostConceptVariation = z.infer<typeof BrandPostConceptVariationSchema>;

/**
 * 3. 4-Variation Concept Output Schema (Batch from LLM)
 */
export const BrandPost4VariationsOutputSchema = z.object({
  campaign_theme: z.string().min(3).max(100),
  focus_summary: z.string().min(10).max(300),
  variations: z.array(BrandPostConceptVariationSchema).length(4),
});

export type BrandPost4VariationsOutput = z.infer<typeof BrandPost4VariationsOutputSchema>;
