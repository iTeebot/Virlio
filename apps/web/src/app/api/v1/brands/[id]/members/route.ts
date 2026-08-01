import { NextRequest } from "next/server";
import { brandService, authService } from "@/server/services";
import { apiSuccess, apiError, apiUnauthorized } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const data = await brandService.getBrandMembersAndInvites(id, session.user.id);
    return apiSuccess(data);
  } catch (error: any) {
    return apiError(error.message || "Failed to fetch members", 500);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { emailOrUsername, role } = body;

    if (!emailOrUsername || !role) {
      return apiError("Email or username and role are required", 400);
    }

    const invitation = await brandService.inviteMember(id, session.user.id, { emailOrUsername, role });
    return apiSuccess(invitation, 201);
  } catch (error: any) {
    return apiError(error.message || "Failed to invite member", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const body = await req.json();
    const { memberId, newRole } = body;

    const updated = await brandService.updateMemberRole(id, session.user.id, memberId, newRole);
    return apiSuccess(updated);
  } catch (error: any) {
    return apiError(error.message || "Failed to update member role", 500);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const { searchParams } = new URL(req.url);
    const memberId = searchParams.get("memberId");
    if (!memberId) return apiError("Missing memberId parameter", 400);

    const removed = await brandService.removeMember(id, session.user.id, memberId);
    return apiSuccess(removed);
  } catch (error: any) {
    return apiError(error.message || "Failed to remove member", 500);
  }
}
