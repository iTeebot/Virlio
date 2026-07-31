import { z } from "zod";

export const updateProfileSchema = z.object({
  display_name: z.string().min(2).max(100).optional(),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
  banner_url: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  country: z.string().length(2).optional(),
  language: z.string().min(2).max(5).optional(),
  timezone: z.string().optional(),
  profile_visibility: z.enum(["public", "private", "friends"]).optional(),
});

export const updateUsernameSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
});
