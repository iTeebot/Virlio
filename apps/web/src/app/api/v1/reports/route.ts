import { NextRequest } from "next/server";
import { reportService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { reportSchema } from "@/lib/validations/engagement";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = reportSchema.parse(body);

    const report = await reportService.submit(session.user.id, parsed);
    return apiSuccess(report, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to submit report", 500);
  }
}
