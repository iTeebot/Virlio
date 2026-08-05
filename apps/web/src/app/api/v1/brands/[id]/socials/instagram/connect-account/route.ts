import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandSocialConnections, brands } from "@virlio/database/schema";
import { encryptToken } from "@/server/services/social/facebook-oauth.service";
import { eq } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

const connectInstagramAccountSchema = z.object({
  account_id: z.string().min(1),
  username: z.string().min(1),
  name: z.string().optional(),
  picture: z.string().optional(),
  linked_page_id: z.string().min(1),
  raw_token: z.string().min(1),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = connectInstagramAccountSchema.parse(body);

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });
    if (!brand) return apiNotFound("Brand not found");

    // Encrypt sensitive token server-side
    const encryptedToken = encryptToken(parsed.raw_token);
    const cleanUsername = parsed.username.startsWith("@") ? parsed.username : `@${parsed.username}`;

    const [connection] = await db
      .insert(brandSocialConnections)
      .values({
        brand_id: brandId,
        platform: "instagram",
        account_id: parsed.linked_page_id,
        page_id: parsed.account_id,
        page_name: cleanUsername,
        page_image_url: parsed.picture || "/images/placeholders/brand-avatar.png",
        access_token: encryptedToken,
        connected_by: session.user.id,
        is_active: true,
        scopes: ["instagram_basic", "instagram_content_publish"],
      })
      .onConflictDoUpdate({
        target: [brandSocialConnections.brand_id, brandSocialConnections.platform, brandSocialConnections.page_id],
        set: {
          page_name: cleanUsername,
          access_token: encryptedToken,
          page_image_url: parsed.picture,
          account_id: parsed.linked_page_id,
          is_active: true,
          updated_at: new Date(),
        },
      })
      .returning();

    return apiSuccess(
      {
        id: connection.id,
        platform: connection.platform,
        page_id: connection.page_id,
        page_name: connection.page_name,
        page_image_url: connection.page_image_url,
      },
      201
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to connect Instagram Business account", 500);
  }
}
