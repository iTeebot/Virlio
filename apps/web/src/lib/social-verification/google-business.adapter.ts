import { SocialPlatformAdapter, VerificationResult } from "./types";

export class GoogleBusinessAdapter implements SocialPlatformAdapter {
  platform = "google_business" as const;

  normalize(input: string): string {
    if (!input) return "";
    let clean = input.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?g\.co\/kgs\//i, "");
    clean = clean.replace(/^https?:\/\/(www\.)?google\.com\/maps\//i, "");
    clean = clean.replace(/\/.*$/, "").trim();
    return clean;
  }

  buildUrl(username: string): string {
    const clean = this.normalize(username);
    if (/^[a-zA-Z0-9_-]+$/.test(clean) && clean.length < 20) {
      return `https://g.co/kgs/${clean}`;
    }
    return `https://www.google.com/maps/search/${encodeURIComponent(clean)}`;
  }

  async verify(rawInput: string): Promise<VerificationResult> {
    const username = this.normalize(rawInput);
    const profileUrl = this.buildUrl(username);

    if (!username || username.length < 2) {
      return {
        exists: false,
        platform: this.platform,
        username: rawInput,
        displayName: rawInput,
        profileUrl,
        error: "Please enter a valid Google Business profile short code or business name.",
      };
    }

    return {
      exists: true,
      platform: this.platform,
      username,
      displayName: username.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=EA4335`,
      bio: "Official Google Business Profile Listing",
      profileUrl,
    };
  }
}
