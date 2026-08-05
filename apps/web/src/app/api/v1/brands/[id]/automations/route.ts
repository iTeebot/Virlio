import { NextRequest } from "next/server";
import { authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound, apiValidationError } from "@/lib/utils/api-response";
import { db } from "@virlio/database";
import { brandAutomations, brandAutomationVersions, brands } from "@virlio/database/schema";
import { eq, and, desc, asc, ilike, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

// Initial default React Flow graph for new automations
const DEFAULT_INITIAL_GRAPH = {
  nodes: [
    {
      id: "node-trigger-1",
      type: "triggerNode",
      position: { x: 100, y: 150 },
      data: {
        label: "Meme Published",
        triggerType: "meme_published",
        description: "Runs whenever this Brand successfully publishes a meme.",
      },
    },
    {
      id: "node-action-facebook-1",
      type: "facebookNode",
      position: { x: 450, y: 150 },
      data: {
        label: "Post to Facebook",
        captionType: "use_meme_description",
        tagsType: "use_meme_tags",
        imageType: "generated_meme",
        visibility: "public",
        status: "implemented",
      },
    },
  ],
  edges: [
    {
      id: "edge-trigger-fb-1",
      source: "node-trigger-1",
      target: "node-action-facebook-1",
      animated: true,
      style: { stroke: "#2563eb", strokeWidth: 2 },
    },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
};

async function ensureTablesExist() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS brand_automations (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        brand_id uuid NOT NULL REFERENCES brands(id),
        name text NOT NULL,
        description text,
        status text NOT NULL DEFAULT 'draft',
        is_enabled boolean NOT NULL DEFAULT false,
        trigger_type text NOT NULL DEFAULT 'meme_published',
        node_count integer NOT NULL DEFAULT 2,
        run_count integer NOT NULL DEFAULT 0,
        last_execution_at timestamp with time zone,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        updated_at timestamp with time zone NOT NULL DEFAULT now(),
        created_by uuid REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS brand_automation_versions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        automation_id uuid NOT NULL REFERENCES brand_automations(id) ON DELETE CASCADE,
        version integer NOT NULL DEFAULT 1,
        graph_data jsonb NOT NULL,
        created_at timestamp with time zone NOT NULL DEFAULT now(),
        created_by uuid REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS brand_automation_executions (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        automation_id uuid NOT NULL REFERENCES brand_automations(id) ON DELETE CASCADE,
        brand_id uuid NOT NULL REFERENCES brands(id),
        version_id uuid REFERENCES brand_automation_versions(id),
        trigger_event text NOT NULL,
        status text NOT NULL DEFAULT 'completed',
        error_message text,
        started_at timestamp with time zone NOT NULL DEFAULT now(),
        completed_at timestamp with time zone
      );

      CREATE TABLE IF NOT EXISTS brand_automation_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        execution_id uuid NOT NULL REFERENCES brand_automation_executions(id) ON DELETE CASCADE,
        node_id text NOT NULL,
        level text NOT NULL DEFAULT 'info',
        message text NOT NULL,
        payload jsonb,
        created_at timestamp with time zone NOT NULL DEFAULT now()
      );
    `);
  } catch (err) {
    console.error("DDL Check:", err);
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all"; // all | enabled | disabled | draft
    const sort = searchParams.get("sort") || "updated"; // updated | created | alpha

    const conditions: any[] = [eq(brandAutomations.brand_id, brandId)];

    if (search.trim()) {
      conditions.push(ilike(brandAutomations.name, `%${search.trim()}%`));
    }

    if (status === "enabled") {
      conditions.push(eq(brandAutomations.is_enabled, true));
    } else if (status === "disabled") {
      conditions.push(and(eq(brandAutomations.is_enabled, false), eq(brandAutomations.status, "disabled")));
    } else if (status === "draft") {
      conditions.push(eq(brandAutomations.status, "draft"));
    }

    let orderBy: any = desc(brandAutomations.updated_at);
    if (sort === "created") orderBy = desc(brandAutomations.created_at);
    if (sort === "alpha") orderBy = asc(brandAutomations.name);

    let list;
    try {
      list = await db.query.brandAutomations.findMany({
        where: and(...conditions),
        orderBy: [orderBy],
      });
    } catch {
      await ensureTablesExist();
      list = await db.query.brandAutomations.findMany({
        where: and(...conditions),
        orderBy: [orderBy],
      });
    }

    return apiSuccess(list);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch brand automations", 500);
  }
}

const createAutomationSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: brandId } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { name, description } = createAutomationSchema.parse(body);

    await ensureTablesExist();

    const brand = await db.query.brands.findFirst({
      where: eq(brands.id, brandId),
    });
    if (!brand) return apiNotFound("Brand not found");

    // Insert master automation
    const [automation] = await db
      .insert(brandAutomations)
      .values({
        brand_id: brandId,
        name,
        description: description || "Automatically publish brand memes to social channels and generate article breakdowns.",
        status: "draft",
        is_enabled: false,
        trigger_type: "meme_published",
        node_count: 2,
        run_count: 0,
        created_by: session.user.id,
      })
      .returning();

    // Insert version 1 initial React Flow graph
    await db.insert(brandAutomationVersions).values({
      automation_id: automation.id,
      version: 1,
      graph_data: DEFAULT_INITIAL_GRAPH,
      created_by: session.user.id,
    });

    return apiSuccess(automation, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to create automation", 500);
  }
}
