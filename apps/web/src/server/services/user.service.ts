import { userRepository } from "../repositories";
import type { User } from "@virlio/database/types";

export async function getProfile(userId: string) {
  return userRepository.findById(userId);
}

export async function getPublicProfile(username: string) {
  return userRepository.findByUsername(username);
}

export async function updateProfile(userId: string, data: Partial<User>) {
  // Add zod validation in API layer or here if imported
  return userRepository.update(userId, data);
}

export async function checkUsernameAvailability(username: string) {
  const user = await userRepository.findByUsername(username);
  return !user;
}

export async function deactivateAccount(userId: string) {
  return userRepository.softDelete(userId);
}
