import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiValidationError } from "@/lib/utils/api-response";
import { createBrandSchema } from "@/lib/validations/brand";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    const brands = await brandService.getPublicBrands({ limit, offset });
    return apiSuccess(brands);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch brands", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const parsed = createBrandSchema.parse(body);

    const brand = await brandService.create(session.user.id, parsed);
    return apiSuccess(brand, 201);
  } catch (error: any) {
    if (error instanceof z.ZodError) return apiValidationError(error.issues);
    return apiError(error.message || "Failed to create brand", 500);
  }
}
