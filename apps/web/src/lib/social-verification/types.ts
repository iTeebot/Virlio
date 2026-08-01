export type SocialPlatform = "instagram" | "facebook" | "linkedin" | "x" | "youtube" | "google_business";

export interface VerificationResult {
  exists: boolean;
  platform: SocialPlatform;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  isVerified?: boolean;
  profileUrl: string;
  error?: string;
}

export interface SocialPlatformAdapter {
  platform: SocialPlatform;
  normalize(input: string): string;
  buildUrl(username: string): string;
  verify(username: string): Promise<VerificationResult>;
}
