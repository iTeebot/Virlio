import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sort: z.string().optional(),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const searchSchema = z.object({
  query: z.string().min(1).max(200),
  filters: z.record(z.any()).optional(),
});

export const uuidSchema = z.string().uuid();

export const slugSchema = z
  .string()
  .min(3)
  .max(100)
  .regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens");
