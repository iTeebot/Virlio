import { badgeRepository, achievementRepository, streakRepository, xpRepository } from "../repositories";

export async function awardBadge(userId: string, badgeSlug: string) {
  const badge = await badgeRepository.findBySlug(badgeSlug);
  if (badge) return badgeRepository.awardToUser(userId, badge.id);
  return null;
}

export async function awardBrandBadge(brandId: string, badgeSlug: string) {
  const badge = await badgeRepository.findBySlug(badgeSlug);
  if (badge) return badgeRepository.awardToBrand(brandId, badge.id);
  return null;
}

export async function updateAchievement(userId: string, achievementSlug: string, incrementBy: number) {
  // In a real app we'd look up achievement ID by slug, here we assume slug is ID for simplicity
  return achievementRepository.updateProgress(userId, achievementSlug, incrementBy);
}

export async function addXP(userId: string, amount: number, reason: string) {
  return xpRepository.addXP(userId, amount, reason);
}

export async function checkLevelUp(userId: string) {
  const level = await xpRepository.getUserLevel(userId);
  return level; // Add logic to check and update levels
}

export async function updateStreak(userId: string, category: string) {
  return streakRepository.incrementStreak(userId, category);
}
