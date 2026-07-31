import { z } from "zod";

export const uploadTemplateSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(2000).optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  language: z.string().min(2).max(5).optional(),
  country: z.string().length(2).optional(),
  tags: z.array(z.string().min(1).max(30)).max(10).optional(),
});

export const updateTemplateSchema = uploadTemplateSchema.partial();
