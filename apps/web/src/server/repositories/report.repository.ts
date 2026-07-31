import { db } from "@virlio/database";
import { reports } from "@virlio/database/schema";
import { eq, and, desc } from "drizzle-orm";

export async function create(data: any) {
  const [report] = await db.insert(reports).values(data).returning();
  return report;
}

export async function findPending(options: { limit?: number; offset?: number } = {}) {
  return db.query.reports.findMany({
    where: eq(reports.status, "pending"),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(reports.created_at),
  });
}

export async function findByEntity(entityType: string, entityId: string) {
  return db.query.reports.findMany({
    where: and(eq(reports.entity_type as any, entityType), eq(reports.entity_id, entityId)),
  });
}

export async function resolve(id: string, moderatorId: string, notes?: string) {
  const [r] = await db
    .update(reports)
    .set({
      status: "resolved",
      moderator_id: moderatorId,
      resolved_at: new Date(),
      moderator_notes: notes || null,
      updated_at: new Date(),
    } as any)
    .where(eq(reports.id, id))
    .returning();
  return r;
}

export async function dismiss(id: string, moderatorId: string, notes?: string) {
  const [r] = await db
    .update(reports)
    .set({
      status: "dismissed",
      moderator_id: moderatorId,
      resolved_at: new Date(),
      moderator_notes: notes || null,
      updated_at: new Date(),
    } as any)
    .where(eq(reports.id, id))
    .returning();
  return r;
}
