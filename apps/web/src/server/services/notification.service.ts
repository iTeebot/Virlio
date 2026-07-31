import { notificationRepository } from "../repositories";

export async function send(userId: string, type: string, title: string, message: string, entityType?: string, entityId?: string) {
  return notificationRepository.create({ userId, type: type as any, title, message, entityType, entityId });
}

export async function getUserNotifications(userId: string, options: { limit?: number; offset?: number } = {}) {
  return notificationRepository.findByUser(userId, options);
}

export async function markRead(notificationId: string, userId: string) {
  // Validate ownership first
  return notificationRepository.markRead(notificationId);
}

export async function markAllRead(userId: string) {
  return notificationRepository.markAllRead(userId);
}
