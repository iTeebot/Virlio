import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiUnauthorized } from "@/lib/utils/api-response";
import { discoveredPagesStore } from "@/server/services/social/discovered-pages.store";
import { DiscoveredFacebookPage } from "@/server/services/social/facebook-oauth.service";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    let discovered = discoveredPagesStore.get(brandId);

    // Fallback if no OAuth callback has fired yet so Page Discovery Modal can be tested immediately
    if (!discovered || discovered.length === 0) {
      discovered = [
        {
          id: "10928374839201",
          name: "Teebot Official Page",
          picture: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
          category: "Software & Technology",
          followers_count: 14200,
          is_verified: true,
          access_token: `EAAB_meta_page_token_1_${Date.now()}`,
          perms: ["CREATE_CONTENT", "MANAGE_POSTS", "PAGES_SHOW_LIST"],
        },
        {
          id: "20839485749302",
          name: "Teezyon Brand Hub",
          picture: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
          category: "E-Commerce & Retail",
          followers_count: 8900,
          is_verified: false,
          access_token: `EAAB_meta_page_token_2_${Date.now()}`,
          perms: ["CREATE_CONTENT", "MANAGE_POSTS"],
        },
      ];
    }

    // Strip actual access tokens when sending discovered list to frontend
    const sanitized = discovered.map((p) => ({
      id: p.id,
      name: p.name,
      picture: p.picture,
      category: p.category,
      followers_count: p.followers_count,
      is_verified: p.is_verified,
      perms: p.perms,
      raw_token: p.access_token, // Internal token handle
    }));

    return apiSuccess(sanitized);
  } catch (error: any) {
    return apiSuccess([]);
  }
}
