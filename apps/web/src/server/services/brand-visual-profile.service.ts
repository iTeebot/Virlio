import * as brandRepository from "../repositories/brand.repository";
import { BrandVisualProfile, BrandVisualProfileSchema } from "@virlio/ai";

/**
 * Extracts and normalizes a deterministic BrandVisualProfile from database records.
 */
export async function getBrandVisualProfile(brandId: string): Promise<BrandVisualProfile> {
  const brand = await brandRepository.findById(brandId);
  if (!brand) {
    throw new Error(`Brand not found: ${brandId}`);
  }

  const kb = await brandRepository.getKnowledgeBase(brandId);
  const kbData = kb || ({} as any);

  // 1. Solid Color Palette Extraction (Clean hex codes with fallback defaults)
  const rawColors = kbData.identity?.colors || {};
  const colors = {
    primary: normalizeHex(rawColors.primary, "#2563EB"),
    secondary: normalizeHex(rawColors.secondary, "#1E40AF"),
    accent: normalizeHex(rawColors.accent, "#F59E0B"),
    darkBackground: normalizeHex(rawColors.darkBackground || rawColors.dark_bg, "#0F172A"),
    lightBackground: normalizeHex(rawColors.lightBackground || rawColors.light_bg, "#F8FAFC"),
    paletteUsageRule: "Use crisp solid colors with high contrast. NEVER use CSS gradients.",
  };

  // 2. Typography
  const rawType = kbData.identity?.typography || {};
  const typography = {
    fontFamily: typeof rawType === "string" ? rawType : rawType.fontFamily || "Inter",
    style: rawType.style || "Modern Sans",
  };

  // 3. Logo
  const logo = {
    url: brand.logo_url || null,
    publicId: brand.logo_public_id || null,
    usageRule: brand.logo_url
      ? "Place official logo in top-left with generous margin on solid background"
      : "No logo asset provided; integrate brand name cleanly into typography",
  };

  // 4. Products & Services Catalog
  const rawProducts = Array.isArray(kbData.products_services?.products)
    ? kbData.products_services.products
    : [];
  const rawServices = Array.isArray(kbData.products_services?.services)
    ? kbData.products_services.services
    : [];
  const rawUsps = Array.isArray(kbData.products_services?.usps)
    ? kbData.products_services.usps
    : [];

  const hasProducts = rawProducts.length > 0;
  const hasServices = rawServices.length > 0;

  // Determine business type
  let businessType: "product" | "service" | "hybrid" | "general" = "general";
  if (hasProducts && hasServices) {
    businessType = "hybrid";
  } else if (hasProducts) {
    businessType = "product";
  } else if (hasServices) {
    businessType = "service";
  }

  // 5. Visual Style & Restrictions
  const rawRestrictions = kbData.restrictions || {};
  const prohibitedStyles = Array.isArray(rawRestrictions.styles_avoid)
    ? rawRestrictions.styles_avoid
    : ["gradients", "neon glow", "clutter", "cartoonish"];
  if (!prohibitedStyles.includes("gradients")) {
    prohibitedStyles.push("gradients");
  }

  const prohibitedColors = Array.isArray(rawRestrictions.colors_avoid)
    ? rawRestrictions.colors_avoid
    : [];

  const visualStyle = {
    stylePreset: kbData.identity?.brand_style || "Modern Minimalist",
    photographyStyle: "Studio lighting, clean solid backdrop, crisp shadows",
    compositionPreference: "Generous negative space, bold focal point",
    toneOfVoice: kbData.brand_voice?.tone || "Friendly & Informative",
    prohibitedStyles,
    prohibitedColors,
  };

  const rawProfile: BrandVisualProfile = {
    brandId: brand.id,
    brandName: brand.name,
    industry: brand.industry || "General",
    subIndustry: brand.sub_industry || undefined,
    businessType,
    colors,
    typography,
    logo,
    visualStyle,
    catalog: {
      hasProducts,
      hasServices,
      products: rawProducts,
      services: rawServices,
      featuredOfferings: hasProducts ? rawProducts.slice(0, 3) : rawServices.slice(0, 3),
      usps: rawUsps,
      targetAudience: Array.isArray(kbData.audience?.target_age_groups)
        ? `${kbData.audience.target_age_groups.join(", ")} interested in ${(kbData.audience.audience_interests || []).join(", ")}`
        : undefined,
    },
  };

  return BrandVisualProfileSchema.parse(rawProfile);
}

function normalizeHex(hex: string | undefined, fallback: string): string {
  if (!hex || typeof hex !== "string") return fallback;
  const trimmed = hex.trim();
  if (/^#([0-9A-F]{3}){1,2}$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  return fallback;
}
