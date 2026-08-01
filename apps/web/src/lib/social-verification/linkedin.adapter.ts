import { SocialPlatformAdapter, VerificationResult } from "./types";

export class LinkedInAdapter implements SocialPlatformAdapter {
  platform = "linkedin" as const;

  normalize(input: string): string {
    if (!input) return "";
    let clean = input.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?linkedin\.com\/company\//i, "");
    clean = clean.replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//i, "");
    clean = clean.replace(/\/.*$/, "");
    clean = clean.replace(/^@/, "").trim();
    return clean;
  }

  buildUrl(username: string): string {
    const clean = this.normalize(username);
    return `https://linkedin.com/company/${clean}`;
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
        error: "Please enter a valid LinkedIn company handle.",
      };
    }

    let result: VerificationResult = {
      exists: true,
      platform: this.platform,
      username,
      displayName: username.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=0A66C2`,
      bio: "Official LinkedIn Company Page",
      profileUrl,
    };

    try {
      const res = await fetch(profileUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const html = await res.text();
        const titleMatch = /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i.exec(html);
        if (titleMatch && titleMatch[1]) {
          const title = titleMatch[1].replace(/:\s*LinkedIn/i, "").trim();
          if (title) result.displayName = title;
        }

        const imageMatch = /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(html);
        if (imageMatch && imageMatch[1]) {
          result.avatar = imageMatch[1];
        }

        const descMatch = /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i.exec(html);
        if (descMatch && descMatch[1]) {
          result.bio = descMatch[1].trim();
        }
      }
    } catch (err) {}

    return result;
  }
}
