import { db } from "@virlio/database";
import { brandSocialConnections } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";
import { decryptToken } from "./facebook-oauth.service";

export interface DiscoveredInstagramAccount {
  id: string; // Instagram Business Account ID
  username: string;
  name: string;
  picture?: string;
  followers_count?: number;
  linkedPageId: string;
  linkedPageName: string;
  raw_token: string; // Facebook Page access token used to manage this IG Account
  isBusiness: boolean;
}

export class InstagramOAuthService {
  /**
   * Discover linked Instagram Business & Creator accounts for all connected Facebook Pages of a brand.
   */
  async discoverLinkedInstagramAccounts(brandId: string): Promise<DiscoveredInstagramAccount[]> {
    try {
      // 1. Get all active connected Facebook Pages for this brand
      const fbConnections = await db.query.brandSocialConnections.findMany({
        where: and(
          eq(brandSocialConnections.brand_id, brandId),
          eq(brandSocialConnections.platform, "facebook"),
          eq(brandSocialConnections.is_active, true)
        ),
      });

      if (!fbConnections || fbConnections.length === 0) {
        return [];
      }

      const discoveredAccounts: DiscoveredInstagramAccount[] = [];

      // 2. Query Meta Graph API for each Facebook Page to get linked IG Business account
      for (const fbConn of fbConnections) {
        try {
          const accessToken = decryptToken(fbConn.access_token);
          const isMockToken = accessToken.startsWith("EAAB_mock_") || accessToken.startsWith("mock_");

          if (isMockToken) {
            // Mock discovery for sandbox / test FB connections
            discoveredAccounts.push({
              id: `ig_biz_${fbConn.page_id}`,
              username: `${fbConn.page_name.toLowerCase().replace(/[^a-z0-9]/g, "_")}_official`,
              name: `${fbConn.page_name} Instagram`,
              picture: fbConn.page_image_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
              followers_count: 18400,
              linkedPageId: fbConn.page_id,
              linkedPageName: fbConn.page_name,
              raw_token: fbConn.access_token,
              isBusiness: true,
            });
            continue;
          }

          const graphUrl = `https://graph.facebook.com/v18.0/${fbConn.page_id}?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${accessToken}`;
          const res = await fetch(graphUrl);
          const data = await res.json();

          if (data.instagram_business_account) {
            const ig = data.instagram_business_account;
            discoveredAccounts.push({
              id: ig.id,
              username: ig.username || "instagram_user",
              name: ig.name || fbConn.page_name,
              picture: ig.profile_picture_url || fbConn.page_image_url || "/images/placeholders/brand-avatar.png",
              followers_count: ig.followers_count || 0,
              linkedPageId: fbConn.page_id,
              linkedPageName: fbConn.page_name,
              raw_token: fbConn.access_token,
              isBusiness: true,
            });
          }
        } catch (err) {
          console.error(`[Instagram Discovery Error for Page ${fbConn.page_id}]:`, err);
        }
      }

      return discoveredAccounts;
    } catch (err) {
      console.error("[Instagram Discovery Error]:", err);
      return [];
    }
  }
}

export const instagramOAuthService = new InstagramOAuthService();
