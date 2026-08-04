import { ProfileScoreResult } from "@/lib/services/profile-score.service";

export interface SettingsUserData {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  country: string;
  website: string;
  image: string;
  avatar_url: string;
  emailVerified: boolean;
  account_status: string;
  role: string;
}

export interface SettingsAccountData {
  provider: string;
  providerAccountId: string;
  type: string;
}

export interface SettingsAllData {
  user: SettingsUserData;
  accounts: SettingsAccountData[];
  profileScore: ProfileScoreResult;
}

let inMemorySettingsCache: SettingsAllData | null = null;
let lastCacheTimestamp = 0;
const CACHE_TTL_MS = 120000; // 2 minutes stale-while-revalidate TTL

export function getCachedSettings(): SettingsAllData | null {
  if (!inMemorySettingsCache) return null;
  return inMemorySettingsCache;
}

export function setCachedSettings(data: SettingsAllData): void {
  inMemorySettingsCache = data;
  lastCacheTimestamp = Date.now();
}

export function updateCachedProfile(partial: Partial<SettingsUserData>): void {
  if (inMemorySettingsCache && inMemorySettingsCache.user) {
    inMemorySettingsCache.user = {
      ...inMemorySettingsCache.user,
      ...partial,
    };
  }
}

export function clearSettingsCache(): void {
  inMemorySettingsCache = null;
  lastCacheTimestamp = 0;
}
