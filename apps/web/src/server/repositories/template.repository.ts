import { db } from "@virlio/database";
import { templates } from "@virlio/database/schema";
import { eq, isNull, and, desc, or, ilike, sql } from "drizzle-orm";
import type { Template } from "@virlio/database/types";

export async function findById(id: string) {
  return (await db.query.templates.findFirst({ where: and(eq(templates.id, id), isNull(templates.deleted_at)) })) || null;
}

export async function findBySlug(slug: string) {
  return (await db.query.templates.findFirst({ where: and(eq(templates.slug, slug), isNull(templates.deleted_at)) })) || null;
}

export async function findByCategory(category: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(eq(templates.category, category), isNull(templates.deleted_at)),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}

export async function findByContributor(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(eq(templates.uploaded_by, userId), isNull(templates.deleted_at)),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}

export async function findPublicTemplates(options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(isNull(templates.deleted_at), eq(templates.visibility, "public")),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(templates.created_at),
  });
}

export async function create(data: Partial<Template>) {
  const [template] = await db.insert(templates).values(data as any).returning();
  return template;
}

export async function update(id: string, data: Partial<Template>) {
  const [template] = await db
    .update(templates)
    .set({ ...data, updated_at: new Date() })
    .where(eq(templates.id, id))
    .returning();
  return template || null;
}

export async function softDelete(id: string) {
  const [template] = await db
    .update(templates)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(templates.id, id))
    .returning();
  return template || null;
}

export async function updateModerationStatus(id: string, status: any, metadata?: any) {
  return update(id, { moderation_status: status, approval_metadata: metadata } as any);
}

export async function incrementDownloads(id: string) {
  await db
    .update(templates)
    .set({ public_score: sql`${templates.public_score} + 1` })
    .where(eq(templates.id, id));
}

export async function search(query: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.templates.findMany({
    where: and(
      isNull(templates.deleted_at),
      or(ilike(templates.title, `%${query}%`), ilike(templates.category, `%${query}%`))
    ),
    limit: options.limit || 10,
    offset: options.offset || 0,
  });
}
