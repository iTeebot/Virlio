import { db } from "@virlio/database";
import {
  brandAutomations,
  brandAutomationExecutions,
  brandAutomationLogs,
  brandSocialConnections,
  memes,
  brands,
} from "@virlio/database/schema";
import { eq, and } from "drizzle-orm";
import { socialPublisher } from "../social/social-publisher.service";

export interface MemePublishedPayload {
  memeId: string;
  brandId: string;
  title: string;
  description?: string;
  hashtags?: string[];
  imageUrl?: string;
  templateTitle?: string;
}

/**
 * Brand Automation Execution Engine.
 * 
 * Orchestrates event-driven workflow graph executions for Virlio brands.
 * Uses centralized SocialPublisherService for automated multi-channel publishing
 * and duplicate post prevention.
 */
export async function handleMemePublishedEvent(payload: MemePublishedPayload) {
  try {
    const { brandId, memeId } = payload;
    if (!brandId || !memeId) return;

    // Fetch active enabled automations for this brand
    const activeAutomations = await db.query.brandAutomations.findMany({
      where: and(
        eq(brandAutomations.brand_id, brandId),
        eq(brandAutomations.is_enabled, true),
        eq(brandAutomations.trigger_type, "meme_published")
      ),
    });

    if (activeAutomations.length === 0) return;

    const meme = await db.query.memes.findFirst({
      where: eq(memes.id, memeId),
    });

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });

    // Check connected social accounts
    const connection = await db.query.brandSocialConnections.findFirst({
      where: and(
        eq(brandSocialConnections.brand_id, brandId),
        eq(brandSocialConnections.platform, "facebook"),
        eq(brandSocialConnections.is_active, true)
      ),
    });

    for (const auto of activeAutomations) {
      // Create execution record
      const [execution] = await db
        .insert(brandAutomationExecutions)
        .values({
          automation_id: auto.id,
          brand_id: brandId,
          trigger_event: "meme_published",
          status: "running",
          started_at: new Date(),
        })
        .returning();

      // Log trigger step
      await db.insert(brandAutomationLogs).values({
        execution_id: execution.id,
        node_id: "node-trigger-1",
        level: "info",
        message: `Trigger fired: Meme Published (${meme?.title || "Branded Meme"})`,
        payload: {
          memeId,
          title: meme?.title,
          description: meme?.description,
          imageUrl: meme?.cloudinary_secure_url,
          brandName: brand?.name,
        },
      });

      if (!connection) {
        await db.insert(brandAutomationLogs).values({
          execution_id: execution.id,
          node_id: "node-action-facebook-1",
          level: "warn",
          message: "Skipped Facebook action: No Facebook Page connected for this brand.",
        });

        await db
          .update(brandAutomationExecutions)
          .set({ status: "completed", completed_at: new Date() })
          .where(eq(brandAutomationExecutions.id, execution.id));

        continue;
      }

      // Execute via Social Publisher Service
      const result = await socialPublisher.publish({
        memeId,
        brandId,
        connectionId: connection.id,
        platform: "facebook",
        caption: meme?.description || meme?.title || undefined,
        tags: Array.isArray(meme?.generated_hashtags) ? (meme?.generated_hashtags as string[]) : undefined,
        appendAttribution: true,
        publishType: "automation",
        automationId: auto.id,
      });

      if (result.success) {
        await db.insert(brandAutomationLogs).values({
          execution_id: execution.id,
          node_id: "node-action-facebook-1",
          level: "info",
          message: `Published meme to Facebook Page (${result.pageName || connection.page_name})`,
          payload: {
            platform: "facebook",
            postUrl: result.postUrl,
            status: "published",
          },
        });
      } else {
        await db.insert(brandAutomationLogs).values({
          execution_id: execution.id,
          node_id: "node-action-facebook-1",
          level: result.isDuplicate ? "warn" : "error",
          message: result.error || "Facebook publishing failed",
          payload: {
            isDuplicate: result.isDuplicate,
            pageName: result.pageName,
          },
        });
      }

      // Complete execution & update run statistics
      await db
        .update(brandAutomationExecutions)
        .set({
          status: result.success ? "completed" : "failed",
          error_message: result.success ? null : result.error,
          completed_at: new Date(),
        })
        .where(eq(brandAutomationExecutions.id, execution.id));

      await db
        .update(brandAutomations)
        .set({
          run_count: (auto.run_count || 0) + 1,
          last_execution_at: new Date(),
        })
        .where(eq(brandAutomations.id, auto.id));
    }
  } catch (err) {
    console.error("[Automation Execution Engine Error]", err);
  }
}
