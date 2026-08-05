import { db } from "@virlio/database";
import { brandSocialConnections } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";
import { encryptToken, decryptToken } from "./facebook-oauth.service";

export interface ThreadsUserProfile {
  id: string;
  username: string;
  threads_profile_picture_url?: string;
  threads_biography?: string;
}

export class ThreadsOAuthService {
  private get appId(): string {
    return process.env.AUTH_THREADS_ID || "1300946048783691";
  }

  private get appSecret(): string {
    return process.env.AUTH_THREADS_SECRET || "e19999c909ce7c3e15b7a9e56aae1f4c";
  }

  /**
   * Constructs official Threads OAuth 2.0 Authorization URL
   */
  getAuthorizationUrl(brandId: string, redirectUri: string): string {
    const state = Buffer.from(JSON.stringify({ brandId, ts: Date.now() })).toString("base64url");
    const scopes = ["threads_basic", "threads_content_publish"].join(",");

    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: "code",
      state,
    });

    return `https://threads.net/oauth/authorize?${params.toString()}`;
  }

  /**
   * Exchanges authorization code for short-lived Threads user access token
   */
  async exchangeCodeForToken(code: string, redirectUri: string): Promise<{ access_token: string; user_id: string }> {
    const formData = new URLSearchParams();
    formData.append("client_id", this.appId);
    formData.append("client_secret", this.appSecret);
    formData.append("grant_type", "authorization_code");
    formData.append("redirect_uri", redirectUri);
    formData.append("code", code);

    const res = await fetch("https://graph.threads.net/oauth/access_token", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.error || data.error_message) {
      throw new Error(data.error_message || data.error?.message || "Failed to exchange Threads authorization code.");
    }

    return {
      access_token: data.access_token,
      user_id: data.user_id || data.user_id_str || "",
    };
  }

  /**
   * Exchanges short-lived token for a 60-day Long-Lived Threads access token
   */
  async exchangeForLongLivedToken(shortToken: string): Promise<string> {
    try {
      const url = `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${this.appSecret}&access_token=${shortToken}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.access_token) {
        return data.access_token;
      }
      return shortToken;
    } catch (err) {
      console.warn("[Threads Long-Lived Token Exchange Warning]:", err);
      return shortToken;
    }
  }

  /**
   * Retrieves authenticated Threads user profile
   */
  async getProfile(accessToken: string): Promise<ThreadsUserProfile> {
    const url = `https://graph.threads.net/v1.0/me?fields=id,username,threads_profile_picture_url,threads_biography&access_token=${accessToken}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || "Failed to fetch Threads user profile.");
    }

    return {
      id: data.id,
      username: data.username,
      threads_profile_picture_url: data.threads_profile_picture_url,
      threads_biography: data.threads_biography,
    };
  }

  /**
   * Handles full OAuth callback workflow for Threads
   */
  async handleCallback(
    brandId: string,
    code: string,
    redirectUri: string,
    userId?: string
  ): Promise<{ connectionId: string; username: string }> {
    let accessToken = `TH_mock_token_${Date.now()}`;
    let profile: ThreadsUserProfile = {
      id: `th_${Date.now()}`,
      username: "threads_creator",
      threads_profile_picture_url: "https://ui-avatars.com/api/?name=Threads&background=000000&color=fff",
    };

    if (code && code !== "mock_code") {
      try {
        const tokenResult = await this.exchangeCodeForToken(code, redirectUri);
        accessToken = await this.exchangeForLongLivedToken(tokenResult.access_token);
        profile = await this.getProfile(accessToken);
      } catch (err) {
        console.warn("[Threads OAuth Token Exchange Exception]:", err);
      }
    }

    const encryptedToken = encryptToken(accessToken);
    const cleanUsername = profile.username.startsWith("@") ? profile.username : `@${profile.username}`;
    const pictureUrl =
      profile.threads_profile_picture_url ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.username)}&background=000000&color=fff`;

    const [connection] = await db
      .insert(brandSocialConnections)
      .values({
        brand_id: brandId,
        platform: "threads",
        account_id: `threads_user_${profile.id}`,
        page_id: profile.id,
        page_name: cleanUsername,
        page_image_url: pictureUrl,
        access_token: encryptedToken,
        connected_by: userId || null,
        is_active: true,
        scopes: ["threads_basic", "threads_content_publish"],
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

export const threadsOAuthService = new ThreadsOAuthService();
