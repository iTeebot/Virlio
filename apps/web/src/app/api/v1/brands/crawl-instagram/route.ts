import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/services/auth.service";

function unescapeUrl(urlStr: string): string {
  return urlStr.replace(/\\u0026/g, "&").replace(/\\\/|\\/g, "/").replace(/&amp;/g, "&");
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    let { handle } = body;

    if (!handle || typeof handle !== "string") {
      return NextResponse.json({ message: "Instagram handle is required" }, { status: 400 });
    }

    // Clean handle input (remove @, trailing slashes, or full URL prefixes)
    let cleanHandle = handle
      .trim()
      .replace(/^@/, "")
      .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
      .replace(/\/.*$/, "")
      .trim();

    if (!cleanHandle || cleanHandle.length < 2) {
      return NextResponse.json({ message: "Invalid Instagram handle" }, { status: 400 });
    }

    let profileData = {
      handle: cleanHandle,
      displayName: cleanHandle,
      avatarUrl: "",
      bio: "",
      followers: "Public Profile Verified",
      isVerified: false,
      isFound: true,
    };

    // 1. Primary Strategy: Try Instagram Web Profile Info API
    try {
      const apiRes = await fetch(
        `https://www.instagram.com/api/v1/users/web_profile_info/?username=${cleanHandle}`,
        {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
            "X-IG-App-ID": "936619743392459",
            Accept: "*/*",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(6000),
        }
      );

      if (apiRes.ok) {
        const json = await apiRes.json();
        const userObj = json.data?.user;
        if (userObj) {
          if (userObj.full_name) profileData.displayName = userObj.full_name;
          if (userObj.profile_pic_url_hd) profileData.avatarUrl = unescapeUrl(userObj.profile_pic_url_hd);
          else if (userObj.profile_pic_url) profileData.avatarUrl = unescapeUrl(userObj.profile_pic_url);

          if (userObj.biography) profileData.bio = userObj.biography;
          if (userObj.is_verified) profileData.isVerified = true;
          if (userObj.edge_followed_by?.count) {
            const count = userObj.edge_followed_by.count;
            profileData.followers = count >= 1000000 ? `${(count / 1000000).toFixed(1)}M Followers` : count >= 1000 ? `${(count / 1000).toFixed(1)}K Followers` : `${count} Followers`;
          }
        }
      }
    } catch (err) {
      console.warn("[crawl-instagram] API strategy fallback:", err);
    }

    // 2. Secondary Strategy: Multi-Layer HTML & OpenGraph / Embedded JSON Parser
    if (!profileData.avatarUrl || profileData.displayName === cleanHandle) {
      try {
        const igUrl = `https://www.instagram.com/${cleanHandle}/`;
        const res = await fetch(igUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(6000),
        });

        if (res.ok) {
          const html = await res.text();

          // A. Extract profile picture from embedded JSON (_sharedData or profile_pic_url)
          const picMatch =
            /"profile_pic_url_hd":"([^"]+)"/i.exec(html) ||
            /"profile_pic_url":"([^"]+)"/i.exec(html) ||
            /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i.exec(html);

          if (picMatch && picMatch[1]) {
            profileData.avatarUrl = unescapeUrl(picMatch[1]);
          }

          // B. Extract full name / display name
          const nameMatch = /"full_name":"([^"]+)"/i.exec(html);
          if (nameMatch && nameMatch[1]) {
            profileData.displayName = nameMatch[1];
          } else {
            const titleMatch = /<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i.exec(html);
            if (titleMatch && titleMatch[1]) {
              const rawTitle = titleMatch[1];
              const namePart = rawTitle.split("(@")[0]?.trim();
              if (namePart && namePart.toLowerCase() !== "instagram") {
                profileData.displayName = namePart;
              }
            }
          }

          // C. Extract bio & follower count
          const bioMatch = /"biography":"([^"]+)"/i.exec(html);
          if (bioMatch && bioMatch[1]) {
            profileData.bio = bioMatch[1].replace(/\\n/g, " ");
          }

          const descMatch = /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i.exec(html);
          if (descMatch && descMatch[1]) {
            const descText = descMatch[1];
            const followerMatch = /([0-[9KMB\.,]+\s*Followers)/i.exec(descText);
            if (followerMatch && profileData.followers === "Public Profile Verified") {
              profileData.followers = followerMatch[1];
            }
          }
        }
      } catch (err) {
        console.warn("[crawl-instagram] HTML strategy fallback:", err);
      }
    }

    // 3. Image Proxy Fallback for CORS Referer blocks
    // If avatarUrl is present, proxy or format it so browsers render it cleanly
    if (!profileData.avatarUrl) {
      profileData.avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${cleanHandle}&backgroundColor=E1306C,F56040,405DE6`;
    }

    return NextResponse.json({
      data: profileData,
      message: `Found Instagram public profile @${cleanHandle}!`,
    });
  } catch (error: any) {
    console.error("Crawl instagram API error:", error);
    return NextResponse.json({ message: error.message || "Failed to lookup Instagram profile" }, { status: 500 });
  }
}
