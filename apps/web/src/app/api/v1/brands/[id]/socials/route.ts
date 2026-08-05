import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandSocialConnections, brands } from "@virlio/database/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const platform = searchParams.get("platform");

    const conditions: any[] = [eq(brandSocialConnections.brand_id, brandId), eq(brandSocialConnections.is_active, true)];
    if (platform) {
      conditions.push(eq(brandSocialConnections.platform, platform));
    }

    const connections = await db.query.brandSocialConnections.findMany({
      where: and(...conditions),
      orderBy: [desc(brandSocialConnections.created_at)],
    });

    // Deduplicate any old fallback placeholder records for Threads
    const threadsConnections = connections.filter((c) => c.platform === "threads");
    if (threadsConnections.length > 1) {
      const extraThreads = threadsConnections.slice(1);
      for (const extra of extraThreads) {
        await db.delete(brandSocialConnections).where(eq(brandSocialConnections.id, extra.id));
      }
    }

    const filteredConnections = connections.filter(
      (c, index, self) => c.platform !== "threads" || index === self.findIndex((t) => t.platform === "threads")
    );

    // Strip sensitive tokens before returning to client
    const sanitized = filteredConnections.map((c) => ({
      id: c.id,
      brand_id: c.brand_id,
      platform: c.platform,
      account_id: c.account_id,
      page_id: c.page_id,
      page_name: c.page_name,
      page_image_url: c.page_image_url,
      is_active: c.is_active,
      created_at: c.created_at,
    }));

    return apiSuccess(sanitized);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch social connections", 500);
  }
}

const connectSocialSchema = z.object({
  platform: z.string().default("facebook"),
  page_id: z.string().min(1),
  page_name: z.string().min(1),
  page_image_url: z.string().optional(),
  access_token: z.string().min(1),
  account_id: z.string().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = connectSocialSchema.parse(body);

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });
    if (!brand) return apiNotFound("Brand not found");

    // Upsert connection
    const [connection] = await db
      .insert(brandSocialConnections)
      .values({
        brand_id: brandId,
        platform: parsed.platform,
        account_id: parsed.account_id || `acc_${Date.now()}`,
        page_id: parsed.page_id,
        page_name: parsed.page_name,
        page_image_url: parsed.page_image_url || "/images/placeholders/brand-avatar.png",
        access_token: parsed.access_token,
        connected_by: session.user.id,
        is_active: true,
      })
      .onConflictDoUpdate({
        target: [brandSocialConnections.brand_id, brandSocialConnections.platform, brandSocialConnections.page_id],
        set: {
          page_name: parsed.page_name,
          access_token: parsed.access_token,
          page_image_url: parsed.page_image_url,
          is_active: true,
          updated_at: new Date(),
        },
      })
      .returning();

    return apiSuccess({
      id: connection.id,
      platform: connection.platform,
      page_id: connection.page_id,
      page_name: connection.page_name,
    }, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to connect social account", 500);
  }
}
