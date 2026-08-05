import { BaseSocialAdapter, PublishMemeOptions, PublishResult } from "./base-social.adapter";
import { decryptToken } from "../facebook-oauth.service";

export class TikTokAdapter implements BaseSocialAdapter {
  platform = "tiktok";

  async publish(options: PublishMemeOptions): Promise<PublishResult> {
    try {
      const {
        pageId: openId,
        accessToken: rawToken,
        caption = "",
        tags = [],
        imageUrl,
        videoUrl,
        appendAttribution = true,
      } = options;

      if (!openId || !rawToken) {
        return { success: false, error: "Missing TikTok Account ID or Access Token." };
      }

      const mediaUrl = videoUrl || imageUrl;
      if (!mediaUrl) {
        return { success: false, error: "TikTok publishing requires a valid image or video URL." };
      }

      const accessToken = decryptToken(rawToken);

      // 1. Build TikTok caption with hashtags & attribution
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
        accessToken.startsWith("TT_mock_token_");

      // 2. Perform direct posting via official TikTok Content Posting API v2 if token is real
      if (!isMockToken) {
        const isVideo = Boolean(videoUrl && videoUrl.endsWith(".mp4"));

        if (isVideo) {
          // Direct Post Video Init
          const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              post_info: {
                title: finalCaption.slice(0, 2200),
                privacy_level: "SELF_ONLY",
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 1000,
              },
              source_info: {
                source: "PULL_FROM_URL",
                video_url: videoUrl,
              },
            }),
          });

          const data = await res.json();
          if (data.error || data.error_code || data.error?.code) {
            const msg = data.error?.message || data.message || "Failed to initialize TikTok video post.";
            console.error("[TikTok Direct Video Post Error]:", data);
            return { success: false, error: msg };
          }

          const publishId = data.data?.publish_id || `tt_pub_${Date.now()}`;
          return {
            success: true,
            externalPostId: publishId,
            postUrl: `https://www.tiktok.com/@creator/video/${publishId}`,
          };
        } else {
          // Direct Post Photo Mode Init
          const res = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              post_info: {
                title: finalCaption.slice(0, 2200),
                privacy_level: "SELF_ONLY",
                disable_comment: false,
              },
              source_info: {
                source: "PULL_FROM_URL",
                photo_images: [imageUrl],
              },
              post_mode: "DIRECT_POST",
              media_type: "PHOTO",
            }),
          });

          const data = await res.json();
          if (data.error || data.error_code || data.error?.code) {
            const msg = data.error?.message || data.message || "Failed to initialize TikTok photo post.";
            console.error("[TikTok Direct Photo Post Error]:", data);
            return { success: false, error: msg };
          }

          const publishId = data.data?.publish_id || `tt_pub_${Date.now()}`;
          return {
            success: true,
            externalPostId: publishId,
            postUrl: `https://www.tiktok.com/@creator/photo/${publishId}`,
          };
        }
      }

      // 3. Fallback for mock test tokens
      const mockPostId = `tt_${openId}_${Date.now()}`;
      return {
        success: true,
        externalPostId: mockPostId,
        postUrl: `https://www.tiktok.com/@creator/video/${mockPostId}`,
      };
    } catch (err: any) {
      console.error("[TikTok Adapter Exception]:", err);
      return { success: false, error: err.message || "Failed to publish to TikTok" };
    }
  }
}

export const tiktokAdapter = new TikTokAdapter();
