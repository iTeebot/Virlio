import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { socialPublisher } from "@/server/services/social/social-publisher.service";
import { z } from "zod";

export const dynamic = "force-dynamic";

const publishMemeSchema = z.object({
  memeId: z.string().min(1),
  connectionId: z.string().optional(),
  platform: z.string().default("facebook"),
  pageId: z.string().optional(),
  caption: z.string().optional(),
  tags: z.array(z.string()).optional(),
  appendAttribution: z.boolean().default(true),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = publishMemeSchema.parse(body);

    const result = await socialPublisher.publish({
      memeId: parsed.memeId,
      brandId,
      connectionId: parsed.connectionId,
      platform: parsed.platform,
      pageId: parsed.pageId,
      caption: parsed.caption,
      tags: parsed.tags,
      appendAttribution: parsed.appendAttribution,
      publishType: "manual",
      userId: session.user.id,
    });

    if (!result.success) {
      return apiError(result.error || "Failed to publish meme", result.isDuplicate ? 409 : 400);
    }

    return apiSuccess(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to publish meme", 500);
  }
}
