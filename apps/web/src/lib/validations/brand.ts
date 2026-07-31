import { z } from "zod";
import { slugSchema } from "./common";

export const createBrandSchema = z.object({
  name: z.string().min(2).max(100),
  slug: slugSchema,
  description: z.string().max(1000).optional(),
  industry: z.string().min(1),
  sub_industry: z.string().optional(),
  country: z.string().length(2).optional(),
  language: z.string().min(2).max(5).optional(),
  website: z.string().url().optional().or(z.literal("")),
  contact_email: z.string().email().optional().or(z.literal("")),
});

export const updateBrandSchema = createBrandSchema.partial();

export const brandVerificationRequestSchema = z.object({
  legal_name: z.string().min(2).max(200),
  website: z.string().url(),
  evidence: z.string().min(10).max(2000),
});
