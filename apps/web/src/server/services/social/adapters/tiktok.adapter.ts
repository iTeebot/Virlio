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

      // Proxy external Cloudinary URLs through virlio.iteebot.com for TikTok Domain Verification compliance
      const appBaseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://virlio.iteebot.com").replace(/\/$/, "");
      
      let proxiedImageUrl = imageUrl;
      let proxiedVideoUrl = videoUrl;

      if (imageUrl && !imageUrl.includes("/api/v1/media/proxy")) {
        proxiedImageUrl = `${appBaseUrl}/api/v1/media/proxy?url=${encodeURIComponent(imageUrl)}`;
      }

      if (videoUrl && !videoUrl.includes("/api/v1/media/proxy")) {
        proxiedVideoUrl = `${appBaseUrl}/api/v1/media/proxy?url=${encodeURIComponent(videoUrl)}`;
      }

      // 1. Build TikTok caption with hashtags & attribution
      let mainText = caption.trim() || "Branded Meme generated with Virlio";

      if (tags.length > 0) {
        const hashtagsText = tags.map((t) => (t.startsWith("#") ? t : `#${t}`)).join(" ");
        mainText += `\n\n${hashtagsText}`;
      }

      if (appendAttribution) {
        mainText += `\n\nGenerated with Virlio\nhttps://virlio.iteebot.com`;
      }

      const isMockToken =
        accessToken.startsWith("EAAB_mock_") ||
        accessToken.startsWith("mock_") ||
        accessToken.startsWith("TT_mock_token_");

      // 2. Perform direct posting via official TikTok Content Posting API v2 if token is real
      if (!isMockToken) {
        const isVideo = Boolean(proxiedVideoUrl && (proxiedVideoUrl.endsWith(".mp4") || proxiedVideoUrl.endsWith(".mov")));

        if (isVideo && proxiedVideoUrl) {
          // Direct Post Video Init
          const res = await fetch("https://open.tiktokapis.com/v2/post/publish/video/init/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              post_info: {
                title: mainText.slice(0, 2200),
                privacy_level: "SELF_ONLY",
                disable_duet: false,
                disable_comment: false,
                disable_stitch: false,
                video_cover_timestamp_ms: 1000,
              },
              source_info: {
                source: "PULL_FROM_URL",
                video_url: proxiedVideoUrl,
              },
            }),
          });

          const data = await res.json();
          console.log("[TikTok Direct Video Post Response]:", data);

          if (data.error || data.error_code || (data.error?.code && data.error?.code !== "ok")) {
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
        } else if (proxiedImageUrl) {
          // Direct Post Photo Mode Init per TikTok official spec
          const res = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify({
              post_info: {
                title: mainText.slice(0, 90),
                description: mainText.slice(0, 2200),
                privacy_level: "SELF_ONLY",
                disable_comment: false,
                auto_add_music: true,
              },
              source_info: {
                source: "PULL_FROM_URL",
                photo_cover_index: 1,
                photo_images: [proxiedImageUrl],
              },
              post_mode: "DIRECT_POST",
              media_type: "PHOTO",
            }),
          });

          const data = await res.json();
          console.log("[TikTok Direct Photo Post Response]:", data);

          if (data.error || data.error_code || (data.error?.code && data.error?.code !== "ok")) {
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
        postUrl: `https://www.tiktok.com/@creator/photo/${mockPostId}`,
      };
    } catch (err: any) {
      console.error("[TikTok Adapter Exception]:", err);
      return { success: false, error: err.message || "Failed to publish to TikTok" };
    }
  }
}

export const tiktokAdapter = new TikTokAdapter();
