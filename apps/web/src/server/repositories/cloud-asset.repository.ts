import { db } from "@virlio/database";
import { cloudAssets } from "@virlio/database/schema";
import { eq, and, isNull } from "drizzle-orm";

export async function create(data: any) {
  const [asset] = await db.insert(cloudAssets).values(data).returning();
  return asset;
}

export async function findByEntity(entityType: string, entityId: string) {
  return db.query.cloudAssets.findMany({
    where: and(
      eq(cloudAssets.entity_type as any, entityType),
      eq(cloudAssets.entity_id, entityId),
      isNull(cloudAssets.deleted_at)
    ),
  });
}

export async function findByPublicId(publicId: string) {
  return (
    (await db.query.cloudAssets.findFirst({
      where: and(eq(cloudAssets.public_id, publicId), isNull(cloudAssets.deleted_at)),
    })) || null
  );
}

export async function softDelete(id: string) {
  const [asset] = await db
    .update(cloudAssets)
    .set({ deleted_at: new Date(), updated_at: new Date() })
    .where(eq(cloudAssets.id, id))
    .returning();
  return asset || null;
}
