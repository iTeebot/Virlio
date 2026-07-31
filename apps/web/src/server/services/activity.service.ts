import { activityRepository } from "../repositories";

export async function logActivity(userId: string, type: string, entityType?: string, entityId?: string, metadata?: any) {
  return activityRepository.create({ userId, activityType: type as any, entityType, entityId, metadata });
}

export async function getUserTimeline(userId: string, options: { limit?: number; offset?: number } = {}) {
  return activityRepository.findByUser(userId, options);
}

export async function getPublicActivity(options: { limit?: number; offset?: number } = {}) {
  return activityRepository.findPublic(options);
}
