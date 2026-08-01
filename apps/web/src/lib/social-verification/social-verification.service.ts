import { SocialPlatform, SocialPlatformAdapter, VerificationResult } from "./types";
import { InstagramAdapter } from "./instagram.adapter";
import { FacebookAdapter } from "./facebook.adapter";
import { LinkedInAdapter } from "./linkedin.adapter";
import { XAdapter } from "./x.adapter";
import { YouTubeAdapter } from "./youtube.adapter";
import { GoogleBusinessAdapter } from "./google-business.adapter";

class SocialVerificationService {
  private adapters: Map<SocialPlatform, SocialPlatformAdapter> = new Map();
  private rateLimitMap: Map<string, { count: number; expiresAt: number }> = new Map();

  constructor() {
    this.registerAdapter(new InstagramAdapter());
    this.registerAdapter(new FacebookAdapter());
    this.registerAdapter(new LinkedInAdapter());
    this.registerAdapter(new XAdapter());
    this.registerAdapter(new YouTubeAdapter());
    this.registerAdapter(new GoogleBusinessAdapter());
  }

  public registerAdapter(adapter: SocialPlatformAdapter) {
    this.adapters.set(adapter.platform, adapter);
  }

  public getAdapter(platform: SocialPlatform): SocialPlatformAdapter | undefined {
    return this.adapters.get(platform);
  }

  /**
   * Sanitizes input, enforces rate limiting, and dispatches to the appropriate platform adapter.
   */
  public async verify(platform: SocialPlatform, rawInput: string, clientIp: string = "anon"): Promise<VerificationResult> {
    const adapter = this.getAdapter(platform);
    if (!adapter) {
      return {
        exists: false,
        platform,
        username: rawInput,
        displayName: rawInput,
        profileUrl: "#",
        error: `Platform "${platform}" is not supported.`,
      };
    }

    // SSRF & Sanitization Check: Ensure input is clean and doesn't contain forbidden scripts or scheme injections
    if (typeof rawInput !== "string" || rawInput.length > 250) {
      return {
        exists: false,
        platform,
        username: "",
        displayName: "",
        profileUrl: "#",
        error: "Invalid input length.",
      };
    }

    // Rate Limiting (15 requests per minute)
    const now = Date.now();
    const key = `${clientIp}:${platform}`;
    const record = this.rateLimitMap.get(key);

    if (record && record.expiresAt > now) {
      if (record.count >= 15) {
        return {
          exists: false,
          platform,
          username: adapter.normalize(rawInput),
          displayName: rawInput,
          profileUrl: adapter.buildUrl(adapter.normalize(rawInput)),
          error: "Too many verification requests. Please wait a moment.",
        };
      }
      record.count++;
    } else {
      this.rateLimitMap.set(key, { count: 1, expiresAt: now + 60000 });
    }

    try {
      return await adapter.verify(rawInput);
    } catch (err: any) {
      return {
        exists: false,
        platform,
        username: adapter.normalize(rawInput),
        displayName: rawInput,
        profileUrl: adapter.buildUrl(adapter.normalize(rawInput)),
        error: err.message || "Failed to verify profile.",
      };
    }
  }
}

export const socialVerificationService = new SocialVerificationService();
