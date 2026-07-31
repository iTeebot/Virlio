import { brandRepository } from "../repositories";
import type { Brand } from "@virlio/database/types";

export async function create(userId: string, data: Partial<Brand>) {
  return brandRepository.create({ ...data, owner_id: userId } as any);
}

export async function update(brandId: string, userId: string, data: Partial<Brand>) {
  const brand = await brandRepository.findById(brandId);
  if (!brand || brand.owner_id !== userId) throw new Error("Unauthorized");
  return brandRepository.update(brandId, data);
}

export async function getBySlug(slug: string) {
  return brandRepository.findBySlug(slug);
}

export async function getByOwner(userId: string) {
  return brandRepository.findByOwner(userId);
}

export async function requestVerification(brandId: string, userId: string, data: any) {
  const brand = await brandRepository.findById(brandId);
  if (!brand || brand.owner_id !== userId) throw new Error("Unauthorized");
  return brandRepository.updateVerificationStatus(brandId, "pending");
}

export async function getPublicBrands(options: { limit?: number; offset?: number } = {}) {
  return brandRepository.findPublicBrands(options);
}
