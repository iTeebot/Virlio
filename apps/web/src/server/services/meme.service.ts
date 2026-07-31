import { memeRepository, brandRepository } from "../repositories";
import type { Meme } from "@virlio/database/types";

export async function create(userId: string, data: Partial<Meme>) {
  if (data.brand_id) {
    const brand = await brandRepository.findById(data.brand_id);
    if (!brand || brand.owner_id !== userId) throw new Error("Unauthorized brand usage");
  }
  return memeRepository.create({ ...data, generator_id: userId } as any);
}

export async function update(memeId: string, userId: string, data: Partial<Meme>) {
  const meme = await memeRepository.findById(memeId);
  if (!meme || meme.generator_id !== userId) throw new Error("Unauthorized");
  return memeRepository.update(memeId, data);
}

export async function getPublicMemes(options: { limit?: number; offset?: number } = {}) {
  return memeRepository.findPublicMemes(options);
}

export async function getByBrand(brandId: string, options: { limit?: number; offset?: number } = {}) {
  return memeRepository.findByBrand(brandId, options);
}
