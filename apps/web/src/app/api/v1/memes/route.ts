import { NextRequest } from "next/server";
import { memeService, authService, authorizationService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { generateMemeSchema } from "@/lib/validations/meme";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const brandId = searchParams.get("brandId");

    let memes;
    if (brandId) {
      const session = await authService.getCurrentSession();
      if (!session?.user?.id) {
        return apiUnauthorized("Sign in to view brand memes");
      }

      const { brandRepository } = await import("@/server/repositories");
      const brand = await brandRepository.findById(brandId);
      if (!brand) return apiError("Brand not found", 404);

      if (brand.owner_id !== session.user.id) {
        const { db } = await import("@virlio/database");
        const { brandMembers } = await import("@virlio/database/schema");
        const { and, eq } = await import("drizzle-orm");

        const membership = await db.query.brandMembers.findFirst({
          where: and(
            eq(brandMembers.brand_id, brandId),
            eq(brandMembers.user_id, session.user.id)
          ),
        });

        if (!membership) {
          return apiError("Unauthorized access to this brand's memes", 403);
        }
      }

      memes = await memeService.getByBrand(brandId, { limit, offset });
    } else {
      memes = await memeService.getPublicMemes({ limit, offset });
    }

    return apiSuccess(memes);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch memes", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = generateMemeSchema.parse(body);

    // Enforce Virlio Authorization Rule: Only Verified Brands can create Memes
    const authCheck = await authorizationService.canCreateMeme(
      session.user.id,
      parsed.brand_id,
      parsed.template_id
    );

    if (!authCheck.allowed) {
      return apiError(authCheck.message, 403);
    }

    const meme = await memeService.create(session.user.id, {
      ...parsed,
      brand_id: authCheck.brand.id,
    });
    const { activityEngine } = await import("@/server/services/activity-engine.service");
    await activityEngine.recordActivity(session.user.id, "meme_generated", "meme", meme?.id || undefined, { brand_id: parsed.brand_id }).catch(() => null);
    return apiSuccess(meme, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to create meme", 500);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { id, status, watermark_enabled, visibility, title, description, hashtags } = z.object({
      id: z.string().uuid(),
      status: z.enum(["accepted", "rejected"]).optional(),
      watermark_enabled: z.boolean().optional(),
      visibility: z.enum(["public", "private"]).optional(),
      title: z.string().max(100).optional(),
      description: z.string().max(300).optional(),
      hashtags: z.array(z.string().max(50)).optional(),
    }).parse(body);

    const { db } = await import("@virlio/database");
    const { memes, templates } = await import("@virlio/database/schema");
    const { eq, and } = await import("drizzle-orm");

    // Fetch the meme first
    const meme = await db.query.memes.findFirst({
      where: and(eq(memes.id, id), eq(memes.generator_id, session.user.id)),
    });

    if (!meme) {
      return apiError("Meme not found or unauthorized.", 404);
    }

    const updates: any = {};
    if (visibility) {
      updates.visibility = visibility;
    }

    // Safety validation on custom user edits (title, description, hashtags)
    const { validateSafetyAndProfanity } = await import("@/lib/validations/safety-filter");

    if (title !== undefined) {
      if (title.trim()) {
        const check = validateSafetyAndProfanity(title);
        if (!check.isValid) {
          return apiError(`Title safety violation: ${check.reason}`, 400);
        }
      }
      updates.title = title.trim() || null;
    }

    if (description !== undefined) {
      if (description.trim()) {
        const check = validateSafetyAndProfanity(description);
        if (!check.isValid) {
          return apiError(`Description safety violation: ${check.reason}`, 400);
        }
      }
      updates.description = description.trim() || null;
    }

    if (hashtags !== undefined) {
      for (const tag of hashtags) {
        if (tag.trim()) {
          const check = validateSafetyAndProfanity(tag);
          if (!check.isValid) {
            return apiError(`Hashtag "${tag}" safety violation: ${check.reason}`, 400);
          }
        }
      }
      updates.generated_hashtags = hashtags;
    }

    if (status === "rejected") {
      updates.status = "rejected";
      updates.updated_at = new Date();
      const updated = await db
        .update(memes)
        .set(updates)
        .where(eq(memes.id, id))
        .returning();
      return apiSuccess(updated[0]);
    }

    if (status === "accepted") {
      if (!meme.template_id) {
        return apiError("Cannot render meme without a valid template.", 400);
      }

      const template = await db.query.templates.findFirst({
        where: eq(templates.id, meme.template_id),
      });

      if (!template || !template.cloudinary_secure_url) {
        return apiError("Template image not found.", 400);
      }

      const { memeRendererService } = await import("@/server/services");
      
      const topText = meme.top_text || meme.generated_caption?.split(" | ")[0] || "";
      const bottomText = meme.bottom_text || meme.generated_caption?.split(" | ")[1] || "";

      const upload = await memeRendererService.renderAndUploadMeme({
        templateImageUrl: template.cloudinary_secure_url,
        topText,
        bottomText,
        regionCaptions: meme.region_captions ? (meme.region_captions as Record<string, string>) : undefined,
        textLayout: meme.text_layout || "top_bottom",
        brandId: meme.brand_id,
        watermarkEnabled: watermark_enabled ?? true,
      });

      updates.status = "accepted";
      updates.cloudinary_secure_url = upload.cloudinary_secure_url;
      updates.cloudinary_public_id = upload.cloudinary_public_id;
      updates.watermark_enabled = watermark_enabled ?? true;
      updates.updated_at = new Date();

      const updated = await db
        .update(memes)
        .set(updates)
        .where(eq(memes.id, id))
        .returning();

      // Trigger activity log for publishing
      const { activityEngine } = await import("@/server/services/activity-engine.service");
      await activityEngine.recordActivity(session.user.id, "meme_published", "meme", id, { brand_id: meme.brand_id }).catch(() => null);

      return apiSuccess(updated[0]);
    }

    if (Object.keys(updates).length > 0) {
      updates.updated_at = new Date();
      const updated = await db
        .update(memes)
        .set(updates)
        .where(eq(memes.id, id))
        .returning();
      return apiSuccess(updated[0]);
    }

    return apiError("No updates provided", 400);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    console.error("[PATCH /api/v1/memes Error]", error);
    return apiError(error.message || "Failed to update meme", 500);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return apiError("Meme ID is required", 400);
    }

    const { db } = await import("@virlio/database");
    const { memes } = await import("@virlio/database/schema");
    const { eq, and } = await import("drizzle-orm");

    // Fetch and check authorization
    const meme = await db.query.memes.findFirst({
      where: and(eq(memes.id, id), eq(memes.generator_id, session.user.id)),
    });

    if (!meme) {
      return apiError("Meme not found or unauthorized.", 404);
    }

    // Soft delete
    const deleted = await db
      .update(memes)
      .set({ deleted_at: new Date(), updated_at: new Date() } as any)
      .where(eq(memes.id, id))
      .returning();

    const { invalidateCacheTag } = await import("@/server/services/cache-server.service");
    invalidateCacheTag("explore");

    return apiSuccess({ message: "Meme successfully deleted", id: deleted[0].id });
  } catch (error: any) {
    console.error("[DELETE /api/v1/memes Error]", error);
    return apiError(error.message || "Failed to delete meme", 500);
  }
}
