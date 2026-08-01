import { SocialPlatformAdapter, VerificationResult } from "./types";

function unescapeUrl(urlStr: string): string {
  return urlStr.replace(/\\u0026/g, "&").replace(/\\\/|\\/g, "/").replace(/&amp;/g, "&");
}

export class InstagramAdapter implements SocialPlatformAdapter {
  platform = "instagram" as const;

  normalize(input: string): string {
    if (!input) return "";
    let clean = input.trim();
    clean = clean.replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
    clean = clean.replace(/\/.*$/, "");
    clean = clean.replace(/^@/, "").trim();
    return clean;
  }

  buildUrl(username: string): string {
    const clean = this.normalize(username);
    return `https://instagram.com/${clean}`;
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
        error: "Please enter a valid Instagram username or handle.",
      };
    }

    let result: VerificationResult = {
      exists: true,
      platform: this.platform,
      username,
      displayName: username,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${username}&backgroundColor=E1306C,F56040,405DE6`,
      bio: "",
      isVerified: false,
      profileUrl,
    };

    // Strategy A: Web Profile Info API
    try {
      const apiRes = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            "X-IG-App-ID": "936619743392459",
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(5000),
        }
      );

      if (apiRes.ok) {
        const json = await apiRes.json();
        const userObj = json.data?.user;
        if (userObj) {
          if (userObj.full_name) result.displayName = userObj.full_name;
          if (userObj.profile_pic_url_hd) result.avatar = unescapeUrl(userObj.profile_pic_url_hd);
          else if (userObj.profile_pic_url) result.avatar = unescapeUrl(userObj.profile_pic_url);
          if (userObj.biography) result.bio = userObj.biography;
          if (userObj.is_verified) result.isVerified = true;
          return result;
        }
      }
    } catch (err) {
      // Fall through to Strategy B
    }

    // Strategy B: Public HTML & OpenGraph Metadata
    try {
      const res = await fetch(profileUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml",
        },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const html = await res.text();

        const picMatch =
          /"profile_pic_url_hd":"([^"]+)"/i.exec(html) ||
          /"profile_pic_url":"([^"]+)"/i.exec(html) ||
          /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(html);
        if (picMatch && picMatch[1]) {
          result.avatar = unescapeUrl(picMatch[1]);
        }

        const nameMatch = /"full_name":"([^"]+)"/i.exec(html);
        if (nameMatch && nameMatch[1]) {
          result.displayName = nameMatch[1];
        } else {
          const titleMatch = /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i.exec(html);
          if (titleMatch && titleMatch[1]) {
            const rawTitle = titleMatch[1];
            const namePart = rawTitle.split("(@")[0]?.trim();
            if (namePart && namePart.toLowerCase() !== "instagram") {
              result.displayName = namePart;
            }
          }
        }

        const descMatch = /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i.exec(html);
        if (descMatch && descMatch[1]) {
          const descText = descMatch[1];
          const bioPart = descText.split("-")?.[1]?.trim() || descText;
          if (bioPart && !bioPart.toLowerCase().includes("see instagram photos")) {
            result.bio = bioPart;
          }
        }
      }
    } catch (err) {
      // Return result with fallback avatar
    }

    return result;
  }
}
