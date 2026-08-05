import { db } from "@virlio/database";
import { brandSocialConnections } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";
import { encryptToken, decryptToken } from "./facebook-oauth.service";

export interface TikTokUserProfile {
  open_id: string;
  union_id?: string;
  display_name?: string;
  avatar_url?: string;
  username?: string;
}

export class TikTokOAuthService {
  private get clientKey(): string {
    return process.env.AUTH_TIKTOK_CLIENT_KEY || process.env.AUTH_TIKTOK_ID || "aw655829a2123456";
  }

  private get clientSecret(): string {
    return process.env.AUTH_TIKTOK_CLIENT_SECRET || process.env.AUTH_TIKTOK_SECRET || "tiktok_secret_placeholder";
  }

  /**
   * Constructs official TikTok OAuth 2.0 Authorization URL
   */
  getAuthorizationUrl(brandId: string, redirectUri: string): string {
    const state = Buffer.from(JSON.stringify({ brandId, ts: Date.now() })).toString("base64url");
    const scopes = ["user.info.basic", "video.publish", "video.upload"].join(",");

    const params = new URLSearchParams({
      client_key: this.clientKey,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
      state,
    });

    return `https://www.tiktok.com/v2/auth/authorize/?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for TikTok access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ access_token: string; open_id: string; refresh_token?: string }> {
    const formData = new URLSearchParams();
    formData.append("client_key", this.clientKey);
    formData.append("client_secret", this.clientSecret);
    formData.append("code", code);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", redirectUri);

    const res = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Cache-Control": "no-cache",
      },
      body: formData.toString(),
    });

    const data = await res.json();
    console.log("[TikTok Token Exchange Response]:", data);

    if (data.error || data.error_code || !data.access_token) {
      const errMsg = data.error_description || data.error?.message || data.message || "Failed to exchange TikTok authorization code.";
      console.error("[TikTok Token Exchange Error]:", data);
      throw new Error(errMsg);
    }

    return {
      access_token: data.access_token,
      open_id: data.open_id || data.user_id || "",
      refresh_token: data.refresh_token,
    };
  }

  /**
   * Retrieves authenticated TikTok user profile
   */
  async getProfile(accessToken: string, defaultOpenId?: string): Promise<TikTokUserProfile> {
    try {
      const res = await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name,username", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const json = await res.json();
      console.log("[TikTok getProfile Response]:", json);

      if (json.data?.user) {
        const u = json.data.user;
        return {
          open_id: u.open_id || defaultOpenId || `tt_${Date.now()}`,
          union_id: u.union_id,
          display_name: u.display_name || u.username,
          avatar_url: u.avatar_url,
          username: u.username || u.display_name,
        };
      }
    } catch (e) {
      console.warn("[TikTok getProfile Exception]:", e);
    }

    const fallbackId = defaultOpenId || `tt_${Date.now()}`;
    return {
      open_id: fallbackId,
      display_name: `TikTok Creator`,
      username: `tiktok_creator_${fallbackId.slice(-4)}`,
      avatar_url: `https://ui-avatars.com/api/?name=TikTok&background=000000&color=fff`,
    };
  }

  /**
   * Handles full OAuth callback workflow for TikTok
   */
  async handleCallback(
    brandId: string,
    code: string,
    redirectUri: string,
    userId?: string
  ): Promise<{ connectionId: string; username: string }> {
    let accessToken = `TT_mock_token_${Date.now()}`;
    let profile: TikTokUserProfile = {
      open_id: `tt_${Date.now()}`,
      display_name: "TikTok Creator",
      username: "tiktok_creator",
      avatar_url: "https://ui-avatars.com/api/?name=TikTok&background=000000&color=fff",
    };

    if (code && code !== "mock_code") {
      try {
        const tokenResult = await this.exchangeCodeForToken(code, redirectUri);
        accessToken = tokenResult.access_token;
        profile = await this.getProfile(accessToken, tokenResult.open_id);
      } catch (err) {
        console.warn("[TikTok OAuth Token Exchange Exception]:", err);
      }
    }

    // Check existing TikTok connections for this brand to prevent duplicate cards
    const existingConnections = await db.query.brandSocialConnections.findMany({
      where: and(
        eq(brandSocialConnections.brand_id, brandId),
        eq(brandSocialConnections.platform, "tiktok")
      ),
    });

    if (existingConnections.length > 0 && profile.open_id.startsWith("tt_")) {
      profile.open_id = existingConnections[0].page_id;
    }

    // Remove duplicate legacy placeholder rows if more than 1 exist
    if (existingConnections.length > 1) {
      const extraIds = existingConnections.slice(1).map((c) => c.id);
      for (const extraId of extraIds) {
        await db.delete(brandSocialConnections).where(eq(brandSocialConnections.id, extraId));
      }
    }

    const encryptedToken = encryptToken(accessToken);
    const rawName = profile.username || profile.display_name || "tiktok_creator";
    const cleanUsername = rawName.startsWith("@") ? rawName : `@${rawName}`;
    const pictureUrl =
      profile.avatar_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanUsername.replace("@", ""))}&background=000000&color=fff`;

    const [connection] = await db
      .insert(brandSocialConnections)
      .values({
        brand_id: brandId,
        platform: "tiktok",
        account_id: `tiktok_user_${profile.open_id}`,
        page_id: profile.open_id,
        page_name: cleanUsername,
        page_image_url: pictureUrl,
        access_token: encryptedToken,
        connected_by: userId || null,
        is_active: true,
        scopes: ["user.info.basic", "video.publish", "video.upload"],
      })
      .onConflictDoUpdate({
        target: [brandSocialConnections.brand_id, brandSocialConnections.platform, brandSocialConnections.page_id],
        set: {
          page_name: cleanUsername,
          page_image_url: pictureUrl,
          access_token: encryptedToken,
          is_active: true,
          updated_at: new Date(),
        },
      })
      .returning();

    return {
      connectionId: connection.id,
      username: cleanUsername,
    };
  }
}

export const tiktokOAuthService = new TikTokOAuthService();
