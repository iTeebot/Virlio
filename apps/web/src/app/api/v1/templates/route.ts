import { NextRequest } from "next/server";
import { templateService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { uploadTemplateSchema } from "@/lib/validations/template";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const query = searchParams.get("query");

    const templates = query
      ? await templateService.search(query, { limit, offset })
      : await templateService.getPublicTemplates({ limit, offset });

    return apiSuccess(templates);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch templates", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = uploadTemplateSchema.parse(body);

    const template = await templateService.upload(session.user.id, parsed);
    return apiSuccess(template, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to upload template", 500);
  }
}
