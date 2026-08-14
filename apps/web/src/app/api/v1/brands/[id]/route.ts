import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";
import { brandRepository } from "@/server/repositories";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();

    const brand = await brandService.getBrandProfile(id, session?.user?.id);
    if (!brand) return apiNotFound("Brand not found");

    return apiSuccess(brand);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch brand", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const updated = await brandService.update(id, session.user.id, body);
    return apiSuccess(updated);
  } catch (error: any) {
    return apiError(error.message || "Failed to update brand", 500);
  }
}
