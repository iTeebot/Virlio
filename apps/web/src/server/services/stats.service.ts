import { statsRepository } from "../repositories";

export async function getUserStats(userId: string) {
  return statsRepository.getUserStats(userId);
}

export async function getBrandStats(brandId: string) {
  return statsRepository.getBrandStats(brandId);
}

export async function recalculateUserStats(userId: string) {
  // In reality this would perform count queries and upsert
  return statsRepository.upsertUserStats(userId, { /* recalculated stats */ });
}

export async function recalculateBrandStats(brandId: string) {
  // In reality this would perform count queries and upsert
  return statsRepository.upsertBrandStats(brandId, { /* recalculated stats */ });
}
