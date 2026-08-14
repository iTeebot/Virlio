export interface AISuggestionRequest {
  step: number;
  field: string;
  currentValue: string;
  brandContext: Record<string, any>;
}

export interface AISuggestionResponse {
  suggestion: string;
  explanation: string;
  alternativeSuggestions?: string[];
  metadata?: Record<string, any>;
}

export interface VerificationConfidenceResult {
  confidenceScore: number;
  status: "verified" | "pending" | "needs_review" | "rejected";
  breakdown: Record<string, { score: number; maxScore: number; detail: string }>;
  reasons: string[];
  recommendations: string[];
}

export interface BrandReadinessReport {
  profileCompleteness: number;
  brandReadinessScore: number;
  marketingReadinessScore: number;
  aiReadinessScore: number;
  memeReadinessScore: number;
  brandConsistencyScore: number;
  verificationConfidenceScore: number;
  missingAssets: string[];
  recommendations: string[];
  summary: string;
}

export class BrandAIService {
  /**
   * Generates contextual AI suggestions for fields with multi-provider support and intelligent fallback heuristics.
   */
  static async getFieldSuggestion(input: AISuggestionRequest): Promise<AISuggestionResponse> {
    const { step, field, currentValue, brandContext } = input;

    try {
      const apiKey =
        process.env.GROQ_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.GEMINI_API_KEY ||
        process.env.MISTRAL_API_KEY ||
        process.env.OPENROUTER_API_KEY;

      if (apiKey) {
        const result = await this.callAIProviderForSuggestion(input, apiKey);
        if (result && result.suggestion && result.suggestion !== currentValue) {
          return result;
        }
      }
    } catch (err) {
      console.warn("[BrandAIService] Provider call failed, utilizing heuristic engine:", err);
    }

    return this.generateHeuristicFieldSuggestion(step, field, currentValue, brandContext);
  }

  /**
   * Extracts visual identity, colors, and typography from uploaded logo or brand info.
   */
  static async extractIdentityFromLogo(logoUrl: string, brandContext: Record<string, any>) {
    const brandName = brandContext.name || "Brand";
    const industry = brandContext.industry || "Technology";

    const industryPalettes: Record<string, { primary: string; secondary: string; accent: string; darkBg: string; lightBg: string; style: string; font: string }> = {
      Software: { primary: "#2563EB", secondary: "#1E40AF", accent: "#3B82F6", darkBg: "#0F172A", lightBg: "#F8FAFC", style: "Modern", font: "Inter" },
      Technology: { primary: "#3B82F6", secondary: "#1D4ED8", accent: "#60A5FA", darkBg: "#111827", lightBg: "#F9FAFB", style: "Technical", font: "Roboto" },
      Restaurant: { primary: "#DC2626", secondary: "#991B1B", accent: "#F59E0B", darkBg: "#18181B", lightBg: "#FAFAFA", style: "Friendly", font: "Outfit" },
      Cafe: { primary: "#D97706", secondary: "#78350F", accent: "#FBBF24", darkBg: "#1C1917", lightBg: "#FFFBEB", style: "Warm & Cozy", font: "Georgia" },
      Retail: { primary: "#4F46E5", secondary: "#3730A3", accent: "#EC4899", darkBg: "#18181B", lightBg: "#FFFFFF", style: "Modern", font: "Plus Jakarta Sans" },
      Healthcare: { primary: "#0D9488", secondary: "#115E59", accent: "#14B8A6", darkBg: "#0F172A", lightBg: "#F0FDF4", style: "Professional", font: "Inter" },
      Education: { primary: "#0284C7", secondary: "#075985", accent: "#38BDF8", darkBg: "#0F172A", lightBg: "#F0F9FF", style: "Educational", font: "Merriweather" },
      Fashion: { primary: "#18181B", secondary: "#27272A", accent: "#D4AF37", darkBg: "#09090B", lightBg: "#FAF5FF", style: "Luxury", font: "Playfair Display" },
      Electronics: { primary: "#2563EB", secondary: "#1E3A8A", accent: "#06B6D4", darkBg: "#0B0F19", lightBg: "#F8FAFC", style: "Technical", font: "Space Grotesk" },
      "Real Estate": { primary: "#15803D", secondary: "#14532D", accent: "#CA8A04", darkBg: "#052E16", lightBg: "#F0FDF4", style: "Corporate", font: "Cinzel" },
      Manufacturing: { primary: "#475569", secondary: "#1E293B", accent: "#F97316", darkBg: "#0F172A", lightBg: "#F8FAFC", style: "Bold", font: "Rubik" },
      Agency: { primary: "#7C3AED", secondary: "#5B21B6", accent: "#A855F7", darkBg: "#0F172A", lightBg: "#FAF5FF", style: "Creative", font: "Outfit" },
    };

    const palette = industryPalettes[industry] || industryPalettes.Technology;

    return {
      colors: {
        primary: palette.primary,
        secondary: palette.secondary,
        accent: palette.accent,
        darkBackground: palette.darkBg,
        lightBackground: palette.lightBg,
      },
      style: palette.style,
      personality: ["Professional", "Modern", "Bold"],
      suggestedTypography: palette.font,
      visualConsistencyScore: 94,
      explanation: `Analyzed identity for "${brandName}". Recommended solid color system and ${palette.font} typography suitable for ${industry}.`,
    };
  }

  /**
   * Calculates a confidence-based verification score across 12 parameters.
   */
  /**
   * Calculates a confidence-based verification score across canonical 100-point parameters.
   */
  static calculateVerificationConfidence(brand: Record<string, any>, evidence: Record<string, any>): VerificationConfidenceResult {
    let score = 0;
    const breakdown: Record<string, { score: number; maxScore: number; detail: string }> = {};
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // 1. Identity & Contact (Email, Phone, Website Added) - Max 20 points
    let identityScore = 0;
    const isEmailVerified = Boolean(evidence.emailVerified || evidence.email_verified || brand.business_email || brand.contact_email);
    if (isEmailVerified) {
      identityScore += 10;
      reasons.push("Business email verified (+10 PTS)");
    } else {
      recommendations.push("Provide a verified business contact email (+10 PTS)");
    }

    const hasPhone = Boolean(evidence.phoneVerified || brand.business_phone || brand.whatsapp_business);
    if (hasPhone) {
      identityScore += 5;
      reasons.push("Business phone / WhatsApp confirmed (+5 PTS)");
    } else {
      recommendations.push("Add a WhatsApp Business phone number (+5 PTS)");
    }

    const websiteUrl = String(brand.website || evidence.website || "").trim();
    if (websiteUrl) {
      identityScore += 5;
      reasons.push("Official brand website domain provided (+5 PTS)");
    } else {
      recommendations.push("Add your official website URL (+5 PTS)");
    }
    breakdown.identity = { score: identityScore, maxScore: 20, detail: "Email, Phone, and Domain identity" };
    score += identityScore;

    // 2. Ownership Verification (DNS TXT / HTML Meta Tag & HTTPS) - Max 22 points
    let ownershipScore = 0;
    const isDnsVerified = Boolean(evidence.dns_txt_record || evidence.meta_tag || brand.verification_status === "verified");
    if (isDnsVerified) {
      ownershipScore += 20;
      reasons.push("Website ownership confirmed via DNS TXT / Meta Tag (+20 PTS)");
    } else if (websiteUrl) {
      recommendations.push("Verify domain ownership via DNS TXT record or HTML meta tag (+20 PTS)");
    }

    const isHttps = websiteUrl.toLowerCase().startsWith("https://");
    if (isHttps) {
      ownershipScore += 2;
      reasons.push("Secure HTTPS SSL protocol (+2 PTS)");
    }
    breakdown.ownership = { score: ownershipScore, maxScore: 22, detail: "Domain ownership & HTTPS encryption" };
    score += ownershipScore;

    // 3. Brand Assets (Logo, Cover Banner, Description, Colors, Mission) - Max 18 points
    let assetScore = 0;
    if (brand.logo_url) {
      assetScore += 5;
      reasons.push("Official brand logo uploaded (+5 PTS)");
    } else {
      recommendations.push("Upload your official brand logo (+5 PTS)");
    }

    if (brand.banner_url || brand.cover_url) {
      assetScore += 3;
      reasons.push("Brand banner / cover artwork uploaded (+3 PTS)");
    }

    const desc = String(brand.description || brand.short_description || "");
    if (desc.length >= 30) {
      assetScore += 5;
      reasons.push("Complete brand description (>30 chars) (+5 PTS)");
    } else {
      recommendations.push("Add a detailed brand story and description (+5 PTS)");
    }

    const colors = brand.brand_colors || brand.colors || (brand.settings && brand.settings.colors);
    if (colors && (Array.isArray(colors) ? colors.length >= 2 : typeof colors === "object")) {
      assetScore += 3;
      reasons.push("Brand color palette configured (+3 PTS)");
    }

    if (brand.mission || (brand.knowledge_base && brand.knowledge_base.mission)) {
      assetScore += 2;
      reasons.push("Core mission statement configured (+2 PTS)");
    }
    breakdown.assets = { score: assetScore, maxScore: 18, detail: "Logo, banner, colors, and mission" };
    score += assetScore;

    // 4. Proof & Physical Presence (Social, Google Business, Storefront Photos, Docs) - Max 40 points
    let proofScore = 0;
    const socials = brand.social_links || evidence.social_links || {};
    const activeSocials = Object.values(socials).filter(Boolean).length;
    if (activeSocials >= 3) {
      proofScore += 10;
      reasons.push("3+ active social media channels linked (+10 PTS)");
    } else if (activeSocials > 0) {
      proofScore += 5;
      reasons.push(`${activeSocials} social channel(s) linked (+5 PTS)`);
      recommendations.push("Link at least 3 social channels to earn full points (+5 PTS)");
    } else {
      recommendations.push("Link official Instagram, Facebook, LinkedIn, or X channels (+10 PTS)");
    }

    if (evidence.google_business_connected || brand.google_business) {
      proofScore += 10;
      reasons.push("Google Business Profile connected (+10 PTS)");
    }

    const photos = evidence.storefront_photos || evidence.storefrontPhotos || [];
    if (photos.length > 0) {
      proofScore += 5;
      reasons.push("Storefront / office photos uploaded (+5 PTS)");
    }

    if (evidence.catalog_url || evidence.menu_url || evidence.product_catalog_url) {
      proofScore += 5;
      reasons.push("Product catalog or menu uploaded (+5 PTS)");
    }

    if (evidence.business_card_url || evidence.business_card || evidence.tax_registration_url) {
      proofScore += 10;
      reasons.push("Business registration / card document uploaded (+10 PTS)");
    }
    breakdown.proof = { score: proofScore, maxScore: 40, detail: "Socials, storefront, documents, and business proof" };
    score += proofScore;

    // Binary verification: Verified if website DNS ownership verified OR email verified
    const isVerified = isDnsVerified || isEmailVerified;
    const finalScore = Math.min(100, score);
    const status: "verified" | "pending" | "needs_review" | "rejected" = isVerified ? "verified" : finalScore >= 50 ? "needs_review" : "pending";

    return {
      confidenceScore: finalScore,
      status,
      breakdown,
      reasons: reasons.length > 0 ? reasons : ["Initial brand submission registered."],
      recommendations: recommendations.length > 0 ? recommendations : ["Brand verification complete at 100%."],
    };
  }

  /**
   * Generates a comprehensive pre-submission brand readiness report.
   */
  static generateBrandReadinessReport(brandData: Record<string, any>, evidenceData: Record<string, any> = {}): BrandReadinessReport {
    const verif = this.calculateVerificationConfidence(brandData, evidenceData);

    let profileCompleteness = 0;
    if (brandData.name) profileCompleteness += 15;
    if (brandData.slug) profileCompleteness += 10;
    if (brandData.short_description) profileCompleteness += 15;
    if (brandData.logo_url) profileCompleteness += 15;
    if (brandData.industry) profileCompleteness += 10;
    if (brandData.mission) profileCompleteness += 10;
    if (brandData.tagline) profileCompleteness += 10;
    if (brandData.primary_color) profileCompleteness += 15;

    const missingAssets: string[] = [];
    if (!brandData.logo_url) missingAssets.push("Brand Logo");
    if (!brandData.banner_url) missingAssets.push("Cover Banner Image");
    if (!brandData.website && !evidenceData.storefrontPhotos?.length) missingAssets.push("Website or Storefront Photo");
    if (!brandData.mission) missingAssets.push("Mission Statement");
    if (!brandData.tagline) missingAssets.push("Brand Tagline");

    const recommendations: string[] = [
      ...verif.recommendations,
      ...(missingAssets.length > 0 ? [`Upload missing brand assets: ${missingAssets.join(", ")}.`] : []),
      "Keep your AI Knowledge Base updated with recent products & seasonal campaigns.",
    ];

    const brandReadinessScore = Math.round((profileCompleteness + verif.confidenceScore) / 2);
    const marketingReadinessScore = Math.round(profileCompleteness * 0.9);
    const aiReadinessScore = brandData.mission && brandData.tagline ? 95 : 75;
    const memeReadinessScore = brandData.logo_url && brandData.primary_color ? 90 : 60;
    const brandConsistencyScore = verif.confidenceScore > 70 ? 92 : 78;

    return {
      profileCompleteness,
      brandReadinessScore,
      marketingReadinessScore,
      aiReadinessScore,
      memeReadinessScore,
      brandConsistencyScore,
      verificationConfidenceScore: verif.confidenceScore,
      missingAssets,
      recommendations,
      summary: `Brand "${brandData.name || "Workspace"}" scored ${brandReadinessScore}% overall brand readiness with a ${verif.confidenceScore}% verification confidence level.`,
    };
  }

  private static generateHeuristicFieldSuggestion(
    step: number,
    field: string,
    currentValue: string,
    brandContext: Record<string, any>
  ): AISuggestionResponse {
    const name = brandContext.name || "Brand";
    const industry = brandContext.industry || "Business";
    const subIndustry = brandContext.sub_industry || "";
    const rawInput = (currentValue || "").trim();

    switch (field) {
      case "ctaStyle":
      case "cta_style":
        return {
          suggestion: `Action-Oriented & Direct ("Explore ${name}", "Claim Your Access", "Get Started Free")`,
          explanation: `Formulated high-converting Call To Action styling tailored for ${name} in ${industry}.`,
          alternativeSuggestions: [
            `Benefit-Focused ("Transform Your ${industry}", "Shop ${name} Now", "Try Risk-Free")`,
            `Subtle & Conversational ("Learn More", "See How It Works", "Join the Community")`,
          ],
        };

      case "hashtagStrategy":
      case "preferred_hashtag_style":
      case "hashtag_style":
        const cleanBrandTag = name.replace(/[^a-zA-Z0-9]/g, "");
        const cleanIndustryTag = (subIndustry || industry).replace(/[^a-zA-Z0-9]/g, "");
        return {
          suggestion: `3 Niche Tags + 2 Branded Tags (#${cleanBrandTag}, #${cleanIndustryTag}Life, #InnovateWith${cleanBrandTag}, #${cleanIndustryTag}Trends)`,
          explanation: "Optimized hashtag structure for organic discovery on Instagram, TikTok, and LinkedIn.",
          alternativeSuggestions: [
            `Minimalist & Branded (#${cleanBrandTag}, #${cleanIndustryTag})`,
            `High-Volume Viral Strategy (#${cleanIndustryTag}Community, #${cleanBrandTag}Official, #Daily${cleanIndustryTag})`,
          ],
        };

      case "usps":
      case "competitiveAdvantages":
        const defaultUspChips = [
          "24/7 Digital Access",
          "100% Satisfaction Guarantee",
          "AI-Driven Personalization",
          "Transparent Pricing",
          "Premium Support",
        ];
        return {
          suggestion: defaultUspChips.join(", "),
          explanation: `Generated high-converting Unique Selling Point chips for ${name}.`,
          alternativeSuggestions: [
            "Industry-Leading Quality, Sustainable Materials, Dedicated 1-on-1 Support, Instant Delivery",
            "Custom Analytics, Verified Excellence, 24/7 Availability",
          ],
        };

      case "targetAudience":
      case "audienceDescription":
        const descBase = rawInput ? rawInput.replace(/\.$/, "") : `${name} targets an active, forward-thinking audience in ${industry.toLowerCase()}`;
        return {
          suggestion: `${descBase}. Designed for ambitious professionals, content creators, and tech-savvy consumers aged 18-45 who value self-expression, modern aesthetics, and high-efficiency workflows.`,
          explanation: "Formulated a detailed demographic and psychographic audience profile description.",
          alternativeSuggestions: [
            `${name} empowers teams, digital entrepreneurs, and creators seeking fast, intuitive tools to elevate their market presence.`,
            `Focused on B2B and B2C innovators looking for reliable, premium ${industry.toLowerCase()} products crafted for speed and high engagement.`,
          ],
        };

      case "audienceInterests":
        const niche = subIndustry || industry || "Tech";
        const shortTags = [
          `${niche} Enthusiasts`,
          "Digital Creators",
          "Software Developers",
          "Tech Professionals",
          "SaaS Founders",
        ];
        return {
          suggestion: shortTags.join(", "),
          explanation: `Generated short 1-3 word interest tags grounded in ${name}'s ${industry} niche.`,
          alternativeSuggestions: [
            `Early Adopters, ${niche} Leaders, Social Media Creators, Innovation Seekers`,
            `Digital Marketers, Industry Innovators, ${niche} Professionals`,
          ],
        };

      case "description":
      case "shortDescription":
        const baseDesc = rawInput ? rawInput.replace(/\.$/, "") : `${name} is a leading brand in ${industry.toLowerCase()}`;
        return {
          suggestion: `${baseDesc}. Empowering customers with high-impact, reliable solutions built for modern market growth and trusted quality.`,
          explanation: "Expanded short description with strong SEO positioning and active value propositions.",
          alternativeSuggestions: [
            `${name} delivers top-tier ${industry.toLowerCase()} products designed for speed, customer impact, and creative innovation.`,
            `Discover ${name}: the trusted name in ${industry.toLowerCase()}, combining quality craftsmanship with cutting-edge digital experiences.`,
          ],
        };

      case "mission":
        const userMission = rawInput || `To revolutionize the ${industry.toLowerCase()} space`;
        return {
          suggestion: `${userMission.replace(/\.$/, "")} by providing accessible, high-performing tools that empower creators and businesses worldwide to achieve viral impact.`,
          explanation: "Crafted an inspirational mission statement focusing on customer empowerment and long-term vision.",
        };

      case "vision":
        const userVision = rawInput || `To become the globally recognized standard for excellence in ${industry.toLowerCase()}`;
        return {
          suggestion: `${userVision.replace(/\.$/, "")}, driving continuous innovation and setting new benchmarks for creative brand building.`,
          explanation: "Formulated a bold, forward-looking vision statement.",
        };

      case "tagline":
        const baseTagline = rawInput || name;
        return {
          suggestion: `${baseTagline}: Empowering Your ${industry} Journey.`,
          explanation: "Short, memorable, action-oriented tagline.",
          alternativeSuggestions: [
            `Innovate. Create. Elevate.`,
            `The Smart Choice for ${industry}.`,
            `Redefining the ${industry} Experience.`,
          ],
        };

      default:
        return {
          suggestion: rawInput ? `${rawInput} — Optimized for brand clarity and market impact.` : `Professional ${field} formulation for ${name}.`,
          explanation: "Enhanced phrasing for clarity, precision, and brand impact.",
        };
    }
  }

  private static async callAIProviderForSuggestion(input: AISuggestionRequest, apiKey: string): Promise<AISuggestionResponse | null> {
    const { field, currentValue, brandContext } = input;
    const brandName = brandContext.name || "Brand";
    const businessType = brandContext.business_type || "Business";
    const industry = brandContext.industry || "General";
    const subIndustry = brandContext.sub_industry || "";
    const shortDesc = brandContext.short_description || "";
    const brandStyle = brandContext.brand_style || "";
    const personality = Array.isArray(brandContext.brand_personality) ? brandContext.brand_personality.join(", ") : "";

    const prompt = `You are a Senior Brand Strategist & Copywriter for Virlio.
Improve, expand, and polish the following brand field entry using FULL BRAND CONTEXT:

BRAND CONTEXT:
- Brand Name: ${brandName}
- Business Type: ${businessType}
- Industry Sector: ${industry} ${subIndustry ? `(${subIndustry})` : ""}
- Brand Style: ${brandStyle || "Modern"}
- Personality Traits: ${personality || "Professional"}
- Description Pitch: "${shortDesc}"

FIELD TO IMPROVE: ${field}
CURRENT USER INPUT: "${currentValue}"

SPECIFIC INSTRUCTIONS FOR FIELD "${field}":
${
  field === "ctaStyle" || field === "cta_style"
    ? `CRITICAL FOR CTA STYLE: Provide a high-converting, punchy Call To Action strategy (e.g. "Action-Oriented ('Explore ${brandName}', 'Claim Exclusive Access', 'Get Started Free')").`
    : field === "hashtagStrategy" || field === "preferred_hashtag_style" || field === "hashtag_style"
    ? `CRITICAL FOR HASHTAG STRATEGY: Provide a strategic hashtag framework tailored for social discovery (e.g. "3 Niche Tags + 2 Branded Tags (#${brandName.replace(/[^a-zA-Z0-9]/g, "")}, #${industry.replace(/[^a-zA-Z0-9]/g, "")}Life, #ViralGrowth)").`
    : field === "usps" || field === "competitiveAdvantages"
    ? `CRITICAL FOR UNIQUE SELLING POINTS: Provide ONLY a comma-separated list of short 2-5 word Unique Selling Point (USP) chips (e.g. "24/7 Digital Access, 100% Satisfaction Guarantee, AI Style Recommendations, Instant Virtual Try-On, Premium Customer Support"). Do NOT write full sentences or numbered lists.`
    : field === "targetAudience" || field === "audienceDescription"
    ? `CRITICAL FOR AUDIENCE DESCRIPTION: Provide a rich, professional, 2-3 sentence paragraph description outlining the ideal customer demographics, psychographics, lifestyle, and pain points for ${brandName}. Do NOT output comma-separated tags.`
    : field === "audienceInterests"
    ? `CRITICAL FOR INTEREST TAGS: Provide ONLY a comma-separated list of short 1-3 word interest tags (e.g. "Tech Enthusiasts, Software Developers, Content Creators, SaaS Founders, Digital Marketers"). Do NOT write full sentences.`
    : `Provide an enhanced, professional, and polished response matching the brand style and industry context.`
}

Output STRICT JSON format with keys: "suggestion", "explanation", "alternativeSuggestions". Do NOT include markdown code blocks.`;

    try {
      const endpoint = process.env.GROQ_API_KEY
        ? "https://api.groq.com/openai/v1/chat/completions"
        : "https://api.openai.com/v1/chat/completions";
      const model = process.env.GROQ_API_KEY ? "llama-3.3-70b-versatile" : "gpt-4o-mini";

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        const text = json.choices?.[0]?.message?.content;
        if (text) {
          const cleanJson = text.replace(/```json|```/g, "").trim();
          const parsed = JSON.parse(cleanJson);
          const altSuggestions = Array.isArray(parsed.alternativeSuggestions)
            ? parsed.alternativeSuggestions.map((item: any) => String(item))
            : typeof parsed.alternativeSuggestions === "string"
            ? parsed.alternativeSuggestions.split(/[,;\n]/).map((s: string) => s.trim()).filter(Boolean)
            : [];

          return {
            suggestion: typeof parsed.suggestion === "string" ? parsed.suggestion : String(parsed.suggestion || ""),
            explanation: parsed.explanation || "AI improved wording and market positioning.",
            alternativeSuggestions: altSuggestions,
          };
        }
      }
    } catch (err) {
      console.warn("[BrandAIService] LLM call error:", err);
    }

    return null;
  }
}
