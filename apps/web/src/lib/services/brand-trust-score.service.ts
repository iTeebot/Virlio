export interface BrandChecklistItem {
  id: string;
  name: string;
  category: "identity" | "ownership" | "assets" | "proof";
  points: number;
  achieved: boolean;
  description: string;
}

export interface BrandTrustScoreResult {
  trustScore: number; // 0 to 100
  isVerified: boolean; // Binary verification state
  checklist: BrandChecklistItem[];
  improvementSuggestions: {
    item: BrandChecklistItem;
    potentialScoreAfter: number;
  }[];
  potentialScore: number;
}

export function calculateBrandTrustScore(brand: any, evidenceData: any = {}): BrandTrustScoreResult {
  const websiteUrl = brand?.website || "";
  const isHttps = websiteUrl.toLowerCase().startsWith("https://");
  const socialLinks = brand?.social_links || brand?.socialLinks || {};
  const socialCount = Object.keys(socialLinks).filter((k) => !!socialLinks[k]).length;
  const brandColors = brand?.brand_colors || brand?.brandColors || [];
  const storefrontPhotos = evidenceData?.storefront_photos || brand?.evidence_data?.storefront_photos || [];
  const businessDoc = evidenceData?.business_card_url || brand?.evidence_data?.business_card_url || "";
  const googleBusiness = evidenceData?.google_business_connected || brand?.evidence_data?.google_business_connected || false;
  const productCatalog = evidenceData?.product_catalog_url || brand?.evidence_data?.product_catalog_url || false;

  // Website Ownership Verified Check (DNS TXT or Meta Tag or explicit verification)
  const dnsTxt = evidenceData?.dns_txt_record || brand?.verification?.evidence_data?.dns_txt_record;
  const metaTag = evidenceData?.meta_tag || brand?.verification?.evidence_data?.meta_tag;
  const isWebsiteOwnershipVerified = Boolean(dnsTxt || metaTag || brand?.verification_status === "verified");

  // Binary Verification Status: Verified if website ownership is verified OR email is verified
  const emailVerified = Boolean(brand?.email_verified ?? true);
  const isVerified = isWebsiteOwnershipVerified || emailVerified;

  const checklist: BrandChecklistItem[] = [
    {
      id: "email_verified",
      name: "Email verified",
      category: "identity",
      points: 10,
      achieved: emailVerified,
      description: "Primary contact email confirmed",
    },
    {
      id: "phone_verified",
      name: "Phone verified",
      category: "identity",
      points: 5,
      achieved: Boolean(brand?.phone_verified || evidenceData?.phone_verified),
      description: "Business phone contact confirmed",
    },
    {
      id: "website_added",
      name: "Website added",
      category: "identity",
      points: 5,
      achieved: Boolean(websiteUrl.trim()),
      description: "Official brand website domain provided",
    },
    {
      id: "website_ownership",
      name: "Website ownership verified",
      category: "ownership",
      points: 20,
      achieved: isWebsiteOwnershipVerified,
      description: "Confirmed domain ownership via DNS TXT record or HTML meta tag",
    },
    {
      id: "https_website",
      name: "HTTPS website",
      category: "ownership",
      points: 2,
      achieved: isHttps,
      description: "Website uses secure SSL encryption (https://)",
    },
    {
      id: "business_logo",
      name: "Business logo",
      category: "assets",
      points: 5,
      achieved: Boolean(brand?.logo_url),
      description: "Uploaded official high-res brand logo",
    },
    {
      id: "cover_image",
      name: "Cover / banner image",
      category: "assets",
      points: 3,
      achieved: Boolean(brand?.banner_url || brand?.cover_url),
      description: "Uploaded branded banner artwork",
    },
    {
      id: "brand_description",
      name: "Complete brand description",
      category: "assets",
      points: 5,
      achieved: Boolean(brand?.description && brand.description.length >= 30),
      description: "Detailed brand story and overview (>30 chars)",
    },
    {
      id: "brand_colors",
      name: "Brand colors configured",
      category: "assets",
      points: 3,
      achieved: Array.isArray(brandColors) && brandColors.length >= 2,
      description: "Set primary and accent brand color palette",
    },
    {
      id: "mission_vision",
      name: "Mission & vision completed",
      category: "assets",
      points: 2,
      achieved: Boolean(brand?.knowledge_base?.mission || brand?.mission),
      description: "Configured core brand values and mission statement",
    },
    {
      id: "social_profiles",
      name: "At least 3 social profiles",
      category: "proof",
      points: 10,
      achieved: socialCount >= 3,
      description: `Linked ${socialCount} of 3 social media platform handles`,
    },
    {
      id: "google_business",
      name: "Google Business connected",
      category: "proof",
      points: 10,
      achieved: Boolean(googleBusiness),
      description: "Linked Google Business Profile",
    },
    {
      id: "storefront_photos",
      name: "Storefront photos",
      category: "proof",
      points: 5,
      achieved: Array.isArray(storefrontPhotos) && storefrontPhotos.length > 0,
      description: "Uploaded office, store, or inventory photos",
    },
    {
      id: "product_catalog",
      name: "Product catalog / menu",
      category: "proof",
      points: 5,
      achieved: Boolean(productCatalog),
      description: "Uploaded product catalog, menu, or pricing sheet",
    },
    {
      id: "business_registration",
      name: "Business registration document",
      category: "proof",
      points: 10,
      achieved: Boolean(businessDoc),
      description: "Uploaded official business license or registration document",
    },
  ];

  const earnedPoints = checklist.filter((item) => item.achieved).reduce((sum, item) => sum + item.points, 0);
  const trustScore = Math.min(100, earnedPoints);

  const uncompletedItems = checklist.filter((item) => !item.achieved);
  const potentialScore = 100;

  let currentPotential = trustScore;
  const improvementSuggestions = uncompletedItems.map((item) => {
    currentPotential += item.points;
    return {
      item,
      potentialScoreAfter: Math.min(100, currentPotential),
    };
  });

  return {
    trustScore,
    isVerified,
    checklist,
    improvementSuggestions,
    potentialScore,
  };
}
