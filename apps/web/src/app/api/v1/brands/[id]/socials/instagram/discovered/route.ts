import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiUnauthorized } from "@/lib/utils/api-response";
import { instagramOAuthService } from "@/server/services/social/instagram-oauth.service";
import { db } from "@virlio/database";
import { brandSocialConnections } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    // Check if brand has active connected Facebook pages first
    const fbConnections = await db.query.brandSocialConnections.findMany({
      where: and(
        eq(brandSocialConnections.brand_id, brandId),
        eq(brandSocialConnections.platform, "facebook"),
        eq(brandSocialConnections.is_active, true)
      ),
    });

    const hasFacebookConnection = fbConnections.length > 0;

    if (!hasFacebookConnection) {
      return apiSuccess({
        hasFacebookConnection: false,
        accounts: [],
        message: "Connect Facebook first to discover linked Instagram Business accounts.",
      });
    }

    const discoveredAccounts = await instagramOAuthService.discoverLinkedInstagramAccounts(brandId);

    return apiSuccess({
      hasFacebookConnection: true,
      accounts: discoveredAccounts,
    });
  } catch (error: any) {
    return apiSuccess({
      hasFacebookConnection: false,
      accounts: [],
      error: error.message,
    });
  }
}
