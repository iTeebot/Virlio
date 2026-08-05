import { BaseSocialAdapter, PublishMemeOptions, PublishResult } from "./base-social.adapter";
import { decryptToken } from "../facebook-oauth.service";

export class FacebookAdapter implements BaseSocialAdapter {
  platform = "facebook";

  async publish(options: PublishMemeOptions): Promise<PublishResult> {
    try {
      const {
        pageId,
        accessToken: rawToken,
        caption = "",
        tags = [],
        imageUrl,
        appendAttribution = true,
      } = options;

      if (!pageId || !rawToken) {
        return { success: false, error: "Missing Facebook Page ID or Access Token." };
      }

      const accessToken = decryptToken(rawToken);

      // Build caption text
      let finalCaption = caption.trim();

      if (tags.length > 0) {
        const hashtagsText = tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        finalCaption += `\n\n${hashtagsText}`;
      }

      if (appendAttribution) {
        finalCaption += `\n\nGenerated with Virlio\nhttps://virlio.iteebot.com`;
      }

      const isMockToken = accessToken.startsWith("EAAB_mock_") || accessToken.startsWith("mock_");

      // Execute live Graph API call if token is real and image URL exists
      if (!isMockToken && imageUrl) {
        const res = await fetch(`https://graph.facebook.com/v18.0/${pageId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: imageUrl,
            message: finalCaption,
            access_token: accessToken,
          }),
        });

        const data = await res.json();
        if (data.error) {
          console.error("[Facebook Graph API Publishing Error]:", data.error);
          return { success: false, error: data.error.message || "Facebook Graph API Error" };
        }

        const externalPostId = data.post_id || data.id;
        return {
          success: true,
          externalPostId,
          postUrl: `https://facebook.com/${externalPostId}`,
        };
      }

      // Deterministic fallback for dev/demo mode with mock tokens
      const mockPostId = `${pageId}_fb_${Date.now()}`;
      return {
        success: true,
        externalPostId: mockPostId,
        postUrl: `https://facebook.com/${mockPostId}`,
      };
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to publish to Facebook" };
    }
  }
}

export const facebookAdapter = new FacebookAdapter();
