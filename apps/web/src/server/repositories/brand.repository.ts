import { db } from "@virlio/database";
import { brands } from "@virlio/database/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
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
    orderBy: desc(brands.created_at),
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
