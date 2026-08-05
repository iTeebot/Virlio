import { db } from "@virlio/database";
import {
  brands,
  brandMembers,
  brandDrafts,
  brandKnowledgeBases,
  brandVerifications,
  brandInvitations,
  brandAuditLogs,
  brandAiHistory,
} from "@virlio/database/schema";
import { eq, isNull, and, desc, inArray } from "drizzle-orm";
import type { Brand } from "@virlio/database/types";

export async function findById(id: string) {
  return (await db.query.brands.findFirst({ where: and(eq(brands.id, id), isNull(brands.deleted_at)) })) || null;
}

export async function findBySlug(slug: string) {
  return (await db.query.brands.findFirst({ where: and(eq(brands.slug, slug), isNull(brands.deleted_at)) })) || null;
}

export async function findByOwner(ownerId: string) {
  return db.query.brands.findMany({ where: and(eq(brands.owner_id, ownerId), isNull(brands.deleted_at)) });
}

export const findByOwnerId = findByOwner;

export async function findUserAccessibleBrands(userId: string) {
  // Finds brands where user is owner OR active brand_member
  const owned = await db.query.brands.findMany({
    where: and(eq(brands.owner_id, userId), isNull(brands.deleted_at)),
  });

  const memberships = await db.query.brandMembers.findMany({
    where: and(eq(brandMembers.user_id, userId), isNull(brandMembers.deleted_at)),
  });

  if (memberships.length === 0) return owned.map((b) => ({ ...b, userRole: "owner" }));

  const memberBrandIds = memberships.map((m) => m.brand_id);
  const memberBrands = await db.query.brands.findMany({
    where: and(inArray(brands.id, memberBrandIds), isNull(brands.deleted_at)),
  });

  const roleMap = new Map(memberships.map((m) => [m.brand_id, m.role]));

  const combined = [...owned.map((b) => ({ ...b, userRole: "owner" }))];

  for (const b of memberBrands) {
    if (!combined.some((c) => c.id === b.id)) {
      combined.push({ ...b, userRole: roleMap.get(b.id) || "viewer" });
    }
  }

  return combined;
}

export async function getUserRoleForBrand(brandId: string, userId: string): Promise<string | null> {
  const brand = await findById(brandId);
  if (!brand) return null;
  if (brand.owner_id === userId) return "owner";

  const member = await db.query.brandMembers.findFirst({
    where: and(eq(brandMembers.brand_id, brandId), eq(brandMembers.user_id, userId), isNull(brandMembers.deleted_at)),
  });

  return member ? member.role : null;
}

export async function create(data: Partial<Brand>) {
  const [brand] = await db.insert(brands).values(data as any).returning();
  return brand;
}

export async function update(id: string, data: Partial<Brand>) {
  const [brand] = await db
    .update(brands)
    .set({ ...data, updated_at: new Date() })
    .where(eq(brands.id, id))
    .returning();
  return brand || null;
}

export async function softDelete(id: string) {
  const [brand] = await db
    .update(brands)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(brands.id, id))
    .returning();
  return brand || null;
}

export async function findPublicBrands(options: { limit?: number; offset?: number }) {
  return db.query.brands.findMany({
    where: isNull(brands.deleted_at),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: [desc(brands.brand_score), desc(brands.digital_presence_score), desc(brands.created_at)],
  });
}

export async function findVerifiedBrands(options: { limit?: number; offset?: number }) {
  return db.query.brands.findMany({
    where: and(isNull(brands.deleted_at), eq(brands.verification_status, "verified")),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}

export async function updateVerificationStatus(id: string, status: any, verifiedBy?: string) {
  return update(id, {
    verification_status: status,
    verification_date: status === "verified" ? new Date() : null,
    verified_by: verifiedBy || null,
  } as any);
}

/* ---------------- DRAFT FUNCTIONS ---------------- */
export async function getDraftByUser(userId: string) {
  return (await db.query.brandDrafts.findFirst({ where: eq(brandDrafts.user_id, userId) })) || null;
}

export async function upsertDraft(userId: string, currentStep: number, stepData: any) {
  const existing = await getDraftByUser(userId);
  if (existing) {
    const [updated] = await db
      .update(brandDrafts)
      .set({ current_step: currentStep, step_data: stepData, updated_at: new Date() })
      .where(eq(brandDrafts.user_id, userId))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(brandDrafts)
      .values({ user_id: userId, current_step: currentStep, step_data: stepData })
      .returning();
    return created;
  }
}

export async function deleteDraftByUser(userId: string) {
  await db.delete(brandDrafts).where(eq(brandDrafts.user_id, userId));
}

/* ---------------- KNOWLEDGE BASE ---------------- */
export async function getKnowledgeBase(brandId: string) {
  return (await db.query.brandKnowledgeBases.findFirst({ where: eq(brandKnowledgeBases.brand_id, brandId) })) || null;
}

export async function upsertKnowledgeBase(brandId: string, data: any) {
  const existing = await getKnowledgeBase(brandId);
  if (existing) {
    const [updated] = await db
      .update(brandKnowledgeBases)
      .set({ ...data, updated_at: new Date() })
      .where(eq(brandKnowledgeBases.brand_id, brandId))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(brandKnowledgeBases)
      .values({ brand_id: brandId, ...data })
      .returning();
    return created;
  }
}

/* ---------------- VERIFICATION ---------------- */
export async function getVerification(brandId: string) {
  return (await db.query.brandVerifications.findFirst({ where: eq(brandVerifications.brand_id, brandId) })) || null;
}

export async function upsertVerification(brandId: string, data: any) {
  const existing = await getVerification(brandId);
  if (existing) {
    const [updated] = await db
      .update(brandVerifications)
      .set({ ...data, updated_at: new Date() })
      .where(eq(brandVerifications.brand_id, brandId))
      .returning();
    return updated;
  } else {
    const [created] = await db
      .insert(brandVerifications)
      .values({ brand_id: brandId, ...data })
      .returning();
    return created;
  }
}

/* ---------------- MEMBERS & INVITATIONS ---------------- */
export async function getMembers(brandId: string) {
  return db.query.brandMembers.findMany({
    where: and(eq(brandMembers.brand_id, brandId), isNull(brandMembers.deleted_at)),
    with: { user: true },
  });
}

export async function addMember(brandId: string, userId: string, role: any, invitedBy?: string) {
  const [member] = await db
    .insert(brandMembers)
    .values({ brand_id: brandId, user_id: userId, role, invited_by: invitedBy || null, accepted_at: new Date() })
    .returning();
  return member;
}

export async function updateMemberRole(memberId: string, role: any) {
  const [updated] = await db
    .update(brandMembers)
    .set({ role, updated_at: new Date() })
    .where(eq(brandMembers.id, memberId))
    .returning();
  return updated || null;
}

export async function removeMember(memberId: string) {
  const [deleted] = await db
    .update(brandMembers)
    .set({ deleted_at: new Date() })
    .where(eq(brandMembers.id, memberId))
    .returning();
  return deleted || null;
}

export async function createInvitation(data: { brand_id: string; email?: string; username?: string; role: any; token: string; invited_by: string; expires_at: Date }) {
  const [invitation] = await db.insert(brandInvitations).values(data).returning();
  return invitation;
}

export async function getInvitationByToken(token: string) {
  return (await db.query.brandInvitations.findFirst({ where: eq(brandInvitations.token, token) })) || null;
}

export async function updateInvitationStatus(id: string, status: string) {
  const [updated] = await db.update(brandInvitations).set({ status }).where(eq(brandInvitations.id, id)).returning();
  return updated || null;
}

export async function getPendingInvitations(brandId: string) {
  return db.query.brandInvitations.findMany({
    where: and(eq(brandInvitations.brand_id, brandId), eq(brandInvitations.status, "pending")),
  });
}

/* ---------------- AUDIT LOGS ---------------- */
export async function createAuditLog(brandId: string, userId: string, action: string, details?: any, ipAddress?: string) {
  await db.insert(brandAuditLogs).values({
    brand_id: brandId,
    user_id: userId,
    action,
    details,
    ip_address: ipAddress || null,
  });
}

export async function getAuditLogs(brandId: string) {
  return db.query.brandAuditLogs.findMany({
    where: eq(brandAuditLogs.brand_id, brandId),
    orderBy: [desc(brandAuditLogs.created_at)],
    limit: 50,
  });
}

/* ---------------- AI HISTORY ---------------- */
export async function createAiHistory(brandId: string, userId: string, knowledgeBase: any, changeSummary?: string) {
  const latest = await db.query.brandAiHistory.findFirst({
    where: eq(brandAiHistory.brand_id, brandId),
    orderBy: [desc(brandAiHistory.version)],
  });
  const version = (latest?.version || 0) + 1;
  const [history] = await db
    .insert(brandAiHistory)
    .values({
      brand_id: brandId,
      user_id: userId,
      version,
      knowledge_base: knowledgeBase,
      change_summary: changeSummary || `Updated AI Knowledge Base (v${version})`,
    })
    .returning();
  return history;
}

export async function getAiHistory(brandId: string) {
  return db.query.brandAiHistory.findMany({
    where: eq(brandAiHistory.brand_id, brandId),
    with: { user: { columns: { id: true, name: true, image: true, username: true } } },
    orderBy: [desc(brandAiHistory.version)],
  });
}

export async function getAiHistoryById(historyId: string) {
  return (await db.query.brandAiHistory.findFirst({ where: eq(brandAiHistory.id, historyId) })) || null;
}

