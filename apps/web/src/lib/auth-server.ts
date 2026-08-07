import { cache } from "react";
import { authService } from "@/server/services";
import { userRepository } from "@/server/repositories";

/**
 * Request-scoped memoized session resolver.
 * Guarantees authService.getCurrentSession() executes EXACTLY ONCE per HTTP request lifecycle.
 */
export const getMemoizedSession = cache(async () => {
  return authService.getCurrentSession();
});

/**
 * Request-scoped memoized current user resolver.
 * Guarantees userRepository.findById() executes EXACTLY ONCE per HTTP request lifecycle.
 */
export const getMemoizedCurrentUser = cache(async () => {
  const session = await getMemoizedSession();
  if (!session?.user?.id) return null;
  return userRepository.findById(session.user.id);
});
