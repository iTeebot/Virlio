import { NextRequest } from "next/server";
import { authService, templateService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";
import { rateLimit } from "@/lib/utils/rate-limit";

export const dynamic = "force-dynamic";

const limiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500,
});

export async function POST(req: NextRequest) {
  try {
    // 1. Session Authorization check
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) {
      return apiUnauthorized("You must be logged in to upload a template");
    }

    // 2. Rate limiting check (max 10 uploads per minute per user)
    try {
      limiter.check(10, `upload_${session.user.id}`);
    } catch (rateErr) {
      return apiError("Upload rate limit exceeded. Please wait a minute before uploading again.", 429);
    }

    const contentType = req.headers.get("content-type") || "";
    let buffer: Buffer | null = null;
    let fileName: string | undefined = undefined;
    let title: string | undefined = undefined;
    let description: string | undefined = undefined;
    let category: string | undefined = undefined;
    let subcategory: string | undefined = undefined;
    let country: string | undefined = undefined;
    let language: string | undefined = undefined;
    let tags: string[] | undefined = undefined;
    let originalSource: string | undefined = undefined;
    let license: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) return apiError("Missing image file in form data", 400);

      const arrayBuffer = await file.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
      fileName = file.name;

      title = (formData.get("title") as string) || undefined;
      description = (formData.get("description") as string) || undefined;
      category = (formData.get("category") as string) || undefined;
      subcategory = (formData.get("subcategory") as string) || undefined;
      country = (formData.get("country") as string) || undefined;
      language = (formData.get("language") as string) || undefined;
      originalSource = (formData.get("originalSource") as string) || undefined;
      license = (formData.get("license") as string) || undefined;

      const rawTags = formData.get("tags") as string;
      if (rawTags) {
        tags = rawTags.split(",").map((t) => t.trim()).filter(Boolean);
      }
    } else {
      const body = await req.json();
      if (!body.base64Data) return apiError("Missing base64Data in request body", 400);
      const base64Clean = body.base64Data.replace(/^data:image\/\w+;base64,/, "");
      buffer = Buffer.from(base64Clean, "base64");
      fileName = body.fileName;
      title = body.title;
      description = body.description;
      category = body.category;
      subcategory = body.subcategory;
      country = body.country;
      language = body.language;
      tags = body.tags;
      originalSource = body.originalSource;
      license = body.license;
    }

    if (!buffer || buffer.length === 0) {
      return apiError("Invalid or empty file payload", 400);
    }

    // 3. Process Full Template Upload Pipeline
    const result = await templateService.processTemplateUpload(session.user.id, {
      buffer,
      fileName,
      title,
      description,
      category,
      subcategory,
      country,
      language,
      tags,
      originalSource,
      license,
    });

    const { activityEngine } = await import("@/server/services/activity-engine.service");
    await activityEngine.recordActivity(session.user.id, "template_uploaded", "template", result?.template?.id || (result as any)?.id || undefined, { title }).catch(() => null);

    return apiSuccess(result, 201);
  } catch (error: any) {
    console.error("[Template Upload Error]", error);
    return apiError(error.message || "Failed to process template upload", 500);
  }
}
