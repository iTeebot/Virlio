import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandSocialConnections, brands } from "@virlio/database/schema";
import { encryptToken } from "@/server/services/social/facebook-oauth.service";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const connectPageSchema = z.object({
  page_id: z.string().min(1),
  page_name: z.string().min(1),
  page_image_url: z.string().optional(),
  access_token: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = connectPageSchema.parse(body);

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });
    if (!brand) return apiNotFound("Brand not found");

    // Encrypt sensitive access token server-side before storing
    const encryptedToken = encryptToken(parsed.access_token);

    const [connection] = await db
      .insert(brandSocialConnections)
      .values({
        brand_id: brandId,
        platform: "facebook",
        account_id: `fb_user_${session.user.id.slice(0, 8)}`,
        page_id: parsed.page_id,
        page_name: parsed.page_name,
        page_image_url: parsed.page_image_url || "/images/placeholders/brand-avatar.png",
        access_token: encryptedToken,
        connected_by: session.user.id,
        is_active: true,
        scopes: ["pages_show_list", "pages_manage_posts", "pages_read_engagement"],
      })
      .onConflictDoUpdate({
        target: [brandSocialConnections.brand_id, brandSocialConnections.platform, brandSocialConnections.page_id],
        set: {
          page_name: parsed.page_name,
          access_token: encryptedToken,
          page_image_url: parsed.page_image_url,
          is_active: true,
          updated_at: new Date(),
        },
      })
      .returning();

    return apiSuccess({
      id: connection.id,
      platform: connection.platform,
      page_id: connection.page_id,
      page_name: connection.page_name,
      page_image_url: connection.page_image_url,
    }, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to connect Facebook Page", 500);
  }
}
