import { brandRepository, templateRepository, userRepository } from "@/server/repositories";

export type MemeAuthCheckResult =
  | { allowed: true; brand: any; template?: any }
  | {
      allowed: false;
      reason: "UNAUTHENTICATED" | "NO_BRAND" | "BRAND_NOT_FOUND" | "BRAND_ACCESS_DENIED" | "BRAND_NOT_VERIFIED" | "TEMPLATE_NOT_FOUND";
      message: string;
      brand?: any;
    };

/**
 * Server-side authorization check for creating a meme.
 * Enforces:
 * 1. User authenticated
 * 2. User owns/belongs to target brand
 * 3. Brand verification_status === 'verified'
 * 4. Target template exists and is available
 */
export async function canCreateMeme(
  userId: string | null | undefined,
  brandId?: string,
  templateId?: string
): Promise<MemeAuthCheckResult> {
  if (!userId) {
    return {
      allowed: false,
      reason: "UNAUTHENTICATED",
      message: "Authentication required to create memes.",
    };
  }

  // Find user's accessible brands
  const userBrands = await brandRepository.findByOwnerId(userId);

  if (!userBrands || userBrands.length === 0) {
    return {
      allowed: false,
      reason: "NO_BRAND",
      message: "Meme creation is available to verified brands. Create your brand to unlock meme creation.",
    };
  }

  // Determine target brand (provided or first user brand)
  let targetBrand = brandId
    ? userBrands.find((b) => b.id === brandId)
    : userBrands[0];

  if (brandId && !targetBrand) {
    // Check if brand exists at all
    const existingBrand = await brandRepository.findById(brandId);
    if (!existingBrand) {
      return {
        allowed: false,
        reason: "BRAND_NOT_FOUND",
        message: "The specified brand could not be found.",
      };
    }
    return {
      allowed: false,
      reason: "BRAND_ACCESS_DENIED",
      message: "You do not have permission to create memes for this brand.",
    };
  }

  if (!targetBrand) {
    return {
      allowed: false,
      reason: "NO_BRAND",
      message: "No brand selected or available.",
    };
  }

  // Enforce Verification Status (VERIFIED only)
  const isVerified =
    targetBrand.verification_status &&
    targetBrand.verification_status.toLowerCase() === "verified";

  if (!isVerified) {
    return {
      allowed: false,
      reason: "BRAND_NOT_VERIFIED",
      message: `Your brand "${targetBrand.name}" is currently ${targetBrand.verification_status || "pending"} verification. Meme creation will become available once your brand is verified.`,
      brand: targetBrand,
    };
  }

  // Validate Template if provided
  let templateObj: any = null;
  if (templateId) {
    templateObj = await templateRepository.findById(templateId);
    if (!templateObj) {
      return {
        allowed: false,
        reason: "TEMPLATE_NOT_FOUND",
        message: "The selected template format could not be found.",
      };
    }
  }

  return {
    allowed: true,
    brand: targetBrand,
    template: templateObj,
  };
}

/**
 * Server-side authorization check for creating a template.
 * Normal users can create templates without needing a verified brand.
 */
export async function canCreateTemplate(userId: string | null | undefined) {
  if (!userId) {
    return {
      allowed: false,
      reason: "UNAUTHENTICATED",
      message: "Authentication required to create or upload templates.",
    };
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    return {
      allowed: false,
      reason: "USER_NOT_FOUND",
      message: "User account not found.",
    };
  }

  return { allowed: true, user };
}
