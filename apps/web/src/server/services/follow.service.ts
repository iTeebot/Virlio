import { followRepository } from "../repositories";

export async function follow(userId: string, targetId: string, targetType: "user" | "brand") {
  return followRepository.follow(userId, targetId, targetType);
}

export async function unfollow(userId: string, targetId: string, targetType: "user" | "brand") {
  return followRepository.unfollow(userId, targetId, targetType);
}

export async function getFollowers(userId: string, options: { limit?: number; offset?: number } = {}) {
  return followRepository.getFollowers(userId, options);
}

export async function getFollowing(userId: string, options: { limit?: number; offset?: number } = {}) {
  return followRepository.getFollowing(userId, options);
}
