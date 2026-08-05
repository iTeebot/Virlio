import { BaseSocialAdapter, PublishMemeOptions, PublishResult } from "./base-social.adapter";
import { decryptToken } from "../facebook-oauth.service";

export class ThreadsAdapter implements BaseSocialAdapter {
  platform = "threads";

  async publish(options: PublishMemeOptions): Promise<PublishResult> {
    try {
      const {
        pageId: threadsUserId,
        accessToken: rawToken,
        caption = "",
        tags = [],
        imageUrl,
        appendAttribution = true,
      } = options;

      if (!threadsUserId || !rawToken) {
        return { success: false, error: "Missing Threads Account ID or Access Token." };
      }

      if (!imageUrl) {
        return { success: false, error: "Threads publishing requires a valid image URL." };
      }

      const accessToken = decryptToken(rawToken);

      // 1. Build Threads post caption with hashtags & attribution
      let finalCaption = caption.trim();

      if (tags.length > 0) {
        const hashtagsText = tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        finalCaption += `\n\n${hashtagsText}`;
      }

      if (appendAttribution) {
        finalCaption += `\n\nGenerated with Virlio\nhttps://virlio.iteebot.com`;
      }

      const isMockToken =
        accessToken.startsWith("EAAB_mock_") ||
        accessToken.startsWith("mock_") ||
        accessToken.startsWith("TH_mock_token_");

      // 2. Perform 2-step Threads Media Container Publishing via official Graph API if token is real
      if (!isMockToken) {
        // Step A: Create Threads Media Container
        const containerRes = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            media_type: "IMAGE",
            image_url: imageUrl,
            text: finalCaption,
            access_token: accessToken,
          }),
        });

        const containerData = await containerRes.json();
        if (containerData.error) {
          console.error("[Threads Container Creation Error]:", containerData.error);
          return {
            success: false,
            error: containerData.error.message || "Failed to create Threads media container.",
          };
        }

        const creationId = containerData.id;
        if (!creationId) {
          return { success: false, error: "Threads did not return a valid container ID." };
        }

        // Step B: Publish Threads Container
        const publishRes = await fetch(`https://graph.threads.net/v1.0/${threadsUserId}/threads_publish`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            creation_id: creationId,
            access_token: accessToken,
          }),
        });

        const publishData = await publishRes.json();
        if (publishData.error) {
          console.error("[Threads Media Publish Error]:", publishData.error);
          return {
            success: false,
            error: publishData.error.message || "Failed to publish Threads media container.",
          };
        }

        const externalPostId = publishData.id || creationId;
        return {
          success: true,
          externalPostId,
          postUrl: `https://www.threads.net/@post/${externalPostId}`,
        };
      }

      // 3. Fallback for mock test tokens
      const mockPostId = `th_${threadsUserId}_${Date.now()}`;
      return {
        success: true,
        externalPostId: mockPostId,
        postUrl: `https://www.threads.net/@post/${mockPostId}`,
      };
    } catch (err: any) {
      console.error("[Threads Adapter Exception]:", err);
      return { success: false, error: err.message || "Failed to publish to Threads" };
    }
  }
}

export const threadsAdapter = new ThreadsAdapter();
