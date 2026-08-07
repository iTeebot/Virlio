import { db } from "@virlio/database";
import { memes } from "@virlio/database/schema";
import { eq, isNull, and, desc } from "drizzle-orm";
import type { Meme } from "@virlio/database/types";

export async function findById(id: string) {
  return (await db.query.memes.findFirst({ where: and(eq(memes.id, id), isNull(memes.deleted_at)) })) || null;
}

export async function findByBrand(brandId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(eq(memes.brand_id, brandId), isNull(memes.deleted_at)),
    with: {
      brand: {
        columns: {
          name: true,
          slug: true,
          logo_url: true,
          verification_status: true,
        }
      },
      generator: {
        columns: {
          username: true,
          name: true,
          image: true,
        }
      }
    },
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.created_at),
  });
}

export async function findByTemplate(templateId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(eq(memes.template_id, templateId), isNull(memes.deleted_at)),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.created_at),
  });
}

export async function findPublicMemes(options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(isNull(memes.deleted_at), eq(memes.visibility, "public")),
    with: {
      brand: {
        columns: {
          name: true,
          slug: true,
          logo_url: true,
          verification_status: true,
        }
      },
      generator: {
        columns: {
          username: true,
          name: true,
          image: true,
        }
      }
    },
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.created_at),
  });
}

export async function findByGenerator(userId: string, options: { limit?: number; offset?: number } = {}) {
  return db.query.memes.findMany({
    where: and(
      eq(memes.generator_id, userId),
      eq(memes.visibility, "public"),
      isNull(memes.deleted_at)
    ),
    limit: options.limit || 10,
    offset: options.offset || 0,
    orderBy: desc(memes.created_at),
  });
}

export async function create(data: Partial<Meme>) {
  const [meme] = await db.insert(memes).values(data as any).returning();
  return meme;
}

export async function update(id: string, data: Partial<Meme>) {
  const [meme] = await db
    .update(memes)
    .set({ ...data, updated_at: new Date() })
    .where(eq(memes.id, id))
    .returning();
  return meme || null;
}

export async function softDelete(id: string) {
  const [meme] = await db
    .update(memes)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(memes.id, id))
    .returning();
  return meme || null;
}
