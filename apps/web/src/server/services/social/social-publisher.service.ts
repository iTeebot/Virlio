import { db } from "@virlio/database";
import { brandSocialConnections, publishingHistory, memes } from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";
import { facebookAdapter } from "./adapters/facebook.adapter";
import { instagramAdapter } from "./adapters/instagram.adapter";
import { BaseSocialAdapter } from "./adapters/base-social.adapter";

export interface PublishMemeRequest {
  memeId: string;
  brandId: string;
  connectionId?: string;
  platform?: string;
  pageId?: string;
  caption?: string;
  tags?: string[];
  appendAttribution?: boolean;
  publishType?: "manual" | "automation";
  automationId?: string;
  userId?: string;
}

export class SocialPublisherService {
  private adapters: Map<string, BaseSocialAdapter> = new Map();

  constructor() {
    this.registerAdapter(facebookAdapter);
    this.registerAdapter(instagramAdapter);
  }

  registerAdapter(adapter: BaseSocialAdapter) {
    this.adapters.set(adapter.platform, adapter);
  }

  async publish(req: PublishMemeRequest) {
    const {
      memeId,
      brandId,
      connectionId,
      platform = "facebook",
      pageId,
      caption,
      tags,
      appendAttribution = true,
      publishType = "manual",
      automationId,
      userId,
    } = req;

    // 1. Fetch Social Connection
    let connection;
    if (connectionId) {
      connection = await db.query.brandSocialConnections.findFirst({
        where: and(eq(brandSocialConnections.id, connectionId), eq(brandSocialConnections.is_active, true)),
      });
    } else if (pageId) {
      connection = await db.query.brandSocialConnections.findFirst({
        where: and(
          eq(brandSocialConnections.brand_id, brandId),
          eq(brandSocialConnections.platform, platform),
          eq(brandSocialConnections.page_id, pageId),
          eq(brandSocialConnections.is_active, true)
        ),
      });
    } else {
      connection = await db.query.brandSocialConnections.findFirst({
        where: and(
          eq(brandSocialConnections.brand_id, brandId),
          eq(brandSocialConnections.platform, platform),
          eq(brandSocialConnections.is_active, true)
        ),
      });
    }

    if (!connection) {
      return {
        success: false,
        error: `No connected ${platform} page found for this brand. Please connect a account in Brand Settings > Social Connections.`,
      };
    }

    // 2. Duplicate Prevention Check
    const existing = await db.query.publishingHistory.findFirst({
      where: and(
        eq(publishingHistory.meme_id, memeId),
        eq(publishingHistory.platform, platform),
        eq(publishingHistory.page_id, connection.page_id)
      ),
    });

    if (existing) {
      return {
        success: false,
        isDuplicate: true,
        publishedAt: existing.published_at,
        pageName: existing.page_name || connection.page_name,
        postUrl: existing.post_url,
        error: `Duplicate post blocked: This meme was already published to ${existing.page_name || connection.page_name} on ${new Date(existing.published_at).toLocaleDateString()}.`,
      };
    }

    // 3. Fetch Meme Details
    const meme = await db.query.memes.findFirst({
      where: eq(memes.id, memeId),
    });

    if (!meme) {
      return { success: false, error: "Meme not found." };
    }

    // 4. Select Adapter
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      return { success: false, error: `Social platform ${platform} adapter is not supported yet.` };
    }

    // 5. Execute Adapter Publishing
    const finalCaption = caption || meme.description || meme.title || "Branded Meme";
    const finalTags = tags || (Array.isArray(meme.generated_hashtags) ? (meme.generated_hashtags as string[]) : []);

    const res = await adapter.publish({
      memeId,
      brandId,
      pageId: connection.page_id,
      accessToken: connection.access_token,
      caption: finalCaption,
      tags: finalTags,
      imageUrl: meme.cloudinary_secure_url || undefined,
      appendAttribution,
      automationId,
      userId,
    });

    if (!res.success) {
      return { success: false, error: res.error || `Failed to publish to ${platform}` };
    }

    // 6. Record Publishing History
    const [historyEntry] = await db
      .insert(publishingHistory)
      .values({
        meme_id: memeId,
        brand_id: brandId,
        platform,
        external_post_id: res.externalPostId || `fb_${Date.now()}`,
        page_id: connection.page_id,
        page_name: connection.page_name,
        automation_id: automationId,
        post_url: res.postUrl,
        published_by: userId,
        publish_type: publishType,
        status: "published",
      })
      .returning();

    return {
      success: true,
      history: historyEntry,
      pageName: connection.page_name,
      postUrl: res.postUrl,
    };
  }
}

export const socialPublisher = new SocialPublisherService();
