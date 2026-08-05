import { BaseSocialAdapter, PublishMemeOptions, PublishResult } from "./base-social.adapter";
import { decryptToken } from "../facebook-oauth.service";

export class InstagramAdapter implements BaseSocialAdapter {
  platform = "instagram";

  async publish(options: PublishMemeOptions): Promise<PublishResult> {
    try {
      const {
        pageId: igAccountId,
        accessToken: rawToken,
        caption = "",
        tags = [],
        imageUrl,
        appendAttribution = true,
      } = options;

      if (!igAccountId || !rawToken) {
        return { success: false, error: "Missing Instagram Account ID or Access Token." };
      }

      if (!imageUrl) {
        return { success: false, error: "Instagram publishing requires a valid image URL." };
      }

      const accessToken = decryptToken(rawToken);

      // 1. Build Instagram caption with hashtags & attribution
      let finalCaption = caption.trim();

      if (tags.length > 0) {
        const hashtagsText = tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        finalCaption += `\n\n${hashtagsText}`;
      }

      if (appendAttribution) {
        finalCaption += `\n\nPosted with Virlio`;
      }

      const isMockToken = accessToken.startsWith("EAAB_mock_") || accessToken.startsWith("mock_");

      // 2. Perform live 2-step Instagram Container publishing via Graph API if token is real
      if (!isMockToken) {
        // Step A: Create Media Container
        const containerRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_url: imageUrl,
            caption: finalCaption,
            access_token: accessToken,
          }),
        });

        const containerData = await containerRes.json();
        if (containerData.error) {
          console.error("[Instagram Container Creation Error]:", containerData.error);
          return {
            success: false,
            error: containerData.error.message || "Failed to create Instagram media container.",
          };
        }

        const creationId = containerData.id;
        if (!creationId) {
          return { success: false, error: "Instagram did not return a valid container ID." };
        }

        // Step B: Publish Media Container
        const publishRes = await fetch(`https://graph.facebook.com/v18.0/${igAccountId}/media_publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: accessToken,
          }),
        });

        const publishData = await publishRes.json();
        if (publishData.error) {
          console.error("[Instagram Media Publish Error]:", publishData.error);
          return {
            success: false,
            error: publishData.error.message || "Failed to publish Instagram media container.",
          };
        }

        const externalPostId = publishData.id || creationId;
        return {
          success: true,
          externalPostId,
          postUrl: `https://instagram.com/p/${externalPostId}`,
        };
      }

      // 3. Fallback for mock test tokens
      const mockPostId = `ig_${igAccountId}_${Date.now()}`;
      return {
        success: true,
        externalPostId: mockPostId,
        postUrl: `https://instagram.com/p/${mockPostId}`,
      };
    } catch (err: any) {
      console.error("[Instagram Adapter Exception]:", err);
      return { success: false, error: err.message || "Failed to publish to Instagram" };
    }
  }
}

export const instagramAdapter = new InstagramAdapter();
