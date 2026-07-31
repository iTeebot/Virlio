import { z } from "zod";
import { uuidSchema } from "./common";

export const voteSchema = z.object({
  entity_type: z.enum(["meme", "template", "comment"]),
  entity_id: uuidSchema,
  vote_type: z.enum(["upvote", "downvote"]),
});

export const reportSchema = z.object({
  entity_type: z.enum(["user", "brand", "meme", "template", "comment"]),
  entity_id: uuidSchema,
  reason: z.enum(["spam", "inappropriate", "harassment", "other"]),
  explanation: z.string().max(1000).optional(),
});

export const commentSchema = z.object({
  entity_type: z.enum(["meme", "template"]),
  entity_id: uuidSchema,
  content: z.string().min(1).max(2000),
  parent_id: uuidSchema.optional(),
});

export const bookmarkSchema = z.object({
  entity_type: z.enum(["meme", "template"]),
  entity_id: uuidSchema,
});
