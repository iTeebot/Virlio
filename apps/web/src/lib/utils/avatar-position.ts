export type AvatarPosition = "center" | "top" | "bottom" | "left" | "right";
export type AvatarFit = "cover" | "contain";

const POSITION_GRAVITY_MAP: Record<AvatarPosition, string> = {
  top: "g_north",
  bottom: "g_south",
  left: "g_west",
  right: "g_east",
  center: "g_center",
};

const GRAVITY_POSITION_MAP: Record<string, AvatarPosition> = {
  g_north: "top",
  g_south: "bottom",
  g_west: "left",
  g_east: "right",
  g_center: "center",
};

/**
 * Embeds canonical gravity transformation & URL position metadata into an avatar URL.
 */
export function applyAvatarPosition(
  url: string,
  position: AvatarPosition = "center",
  fit: AvatarFit = "cover"
): string {
  if (!url || typeof url !== "string") return "";
  let clean = url.trim().replace(/#(pos|fit)=[^#&]*/g, "").replace(/\?v=\d+/g, "");

  const gravity = POSITION_GRAVITY_MAP[position] || "g_center";

  // If Cloudinary URL, embed canonical gravity transformation
  if (clean.includes("res.cloudinary.com") && clean.includes("/upload/")) {
    // Strip existing transformations if present
    clean = clean.replace(/\/upload\/(?:c_fill,g_[a-z]+\/)?/g, `/upload/c_fill,${gravity}/`);
  }

  // Append fragment so CSS object-position parser extracts exact positioning for any renderer
  return `${clean}#pos=${position}&fit=${fit}`;
}

/**
 * Parses canonical avatar positioning and CSS object-position from an avatar URL.
 */
export function parseAvatarPosition(url?: string | null): {
  objectPosition: AvatarPosition;
  objectFit: AvatarFit;
  cleanUrl: string;
} {
  if (!url || typeof url !== "string") {
    return { objectPosition: "center", objectFit: "cover", cleanUrl: "" };
  }

  let position: AvatarPosition = "center";
  let fit: AvatarFit = "cover";

  // 1. Check for URL fragment #pos=...
  const posMatch = url.match(/#pos=(center|top|bottom|left|right)/);
  if (posMatch) {
    position = posMatch[1] as AvatarPosition;
  }

  const fitMatch = url.match(/#fit=(cover|contain)/);
  if (fitMatch) {
    fit = fitMatch[1] as AvatarFit;
  }

  // 2. Check for Cloudinary gravity transformation g_north, g_south, etc.
  if (position === "center" && url.includes("res.cloudinary.com")) {
    for (const [gravity, pos] of Object.entries(GRAVITY_POSITION_MAP)) {
      if (url.includes(gravity)) {
        position = pos;
        break;
      }
    }
  }

  const cleanUrl = url.split("#")[0];

  return { objectPosition: position, objectFit: fit, cleanUrl };
}
