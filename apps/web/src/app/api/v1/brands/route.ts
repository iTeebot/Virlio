import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { fullBrandWizardSchema } from "@/lib/validations/brand-wizard";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode");

    if (mode === "my" && session?.user?.id) {
      const userBrands = await brandService.getByOwner(session.user.id);
      return apiSuccess(userBrands);
    }

    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const publicBrands = await brandService.getPublicBrands({ limit, offset });
    return apiSuccess(publicBrands);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch brands", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();

    let brand;
    if (body.step1 && body.step2) {
      const parsedWizard = fullBrandWizardSchema.parse(body);
      brand = await brandService.createFromWizard(session.user.id, parsedWizard);
    } else {
      brand = await brandService.create(session.user.id, body);
    }

    // Recalculate caller analytics & award brand creation XP
    const { userAnalyticsEngine } = await import("@/server/services/xp-engine.service");
    await userAnalyticsEngine.recalculateUserAnalytics(session.user.id).catch(() => null);

    const { activityEngine } = await import("@/server/services/activity-engine.service");
    await activityEngine.recordActivity(session.user.id, "brand_created", "brand", brand.id, { name: brand.name }).catch(() => null);

    return apiSuccess(brand, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to create brand", 500);
  }
}
