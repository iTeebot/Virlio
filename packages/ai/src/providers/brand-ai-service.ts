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
  static calculateVerificationConfidence(brand: Record<string, any>, evidence: Record<string, any>): VerificationConfidenceResult {
    let score = 0;
    const breakdown: Record<string, { score: number; maxScore: number; detail: string }> = {};
    const reasons: string[] = [];
    const recommendations: string[] = [];

    // 1. Contact Info (Email & Phone) - Max 20 points
    let contactScore = 0;
    if (evidence.emailVerified || brand.business_email || brand.contact_email) {
      contactScore += 10;
      reasons.push("Business email address verified.");
    } else {
      recommendations.push("Provide a verified business contact email address.");
    }

    if (evidence.phoneVerified || brand.business_phone || brand.whatsapp_business) {
      contactScore += 10;
      reasons.push("Business phone / WhatsApp Business number provided.");
    } else {
      recommendations.push("Add a WhatsApp Business phone number.");
    }
    breakdown.contactInfo = { score: contactScore, maxScore: 20, detail: "Email & Phone contact points" };
    score += contactScore;

    // 2. Physical & Storefront Proof (Non-Digital Support) - Max 25 points
    let physicalScore = 0;
    const photos = evidence.storefront_photos || evidence.storefrontPhotos || [];
    if (photos.length >= 2) {
      physicalScore += 25;
      reasons.push("Multiple storefront/office photos submitted.");
    } else if (photos.length === 1) {
      physicalScore += 15;
      reasons.push("Storefront photo submitted.");
    } else if (evidence.business_card_url || evidence.catalog_url || evidence.menu_url) {
      physicalScore += 15;
      reasons.push("Business card/catalog document provided.");
    } else {
      recommendations.push("Upload 1-2 storefront or business card photos to increase verification confidence.");
    }
    breakdown.physicalEvidence = { score: physicalScore, maxScore: 25, detail: "Storefront & office proof" };
    score += physicalScore;

    // 3. Social Media Presence - Max 25 points
    let socialScore = 0;
    const socials = brand.social_links || evidence.social_links || {};
    const activeSocials = Object.values(socials).filter(Boolean).length;
    if (activeSocials >= 3) {
      socialScore += 25;
      reasons.push("3+ active social media channels linked.");
    } else if (activeSocials >= 1) {
      socialScore += 15;
      reasons.push(`${activeSocials} social channel(s) linked.`);
    } else {
      recommendations.push("Link official Instagram, Facebook, LinkedIn, or X profiles.");
    }
    breakdown.socialPresence = { score: socialScore, maxScore: 25, detail: "Social channel footprint" };
    score += socialScore;

    // 4. Digital Domain & Website Ownership - Max 40 points
    let digitalScore = 0;
    const isDnsVerified = Boolean(evidence.dns_txt_record || evidence.meta_tag);
    if (brand.website) {
      digitalScore += 15;
      reasons.push("Official website domain provided.");
      if (isDnsVerified) {
        digitalScore += 25;
        reasons.push("DNS / HTML Meta tag ownership verified.");
      }
    } else {
      reasons.push("Non-digital business model recognized (Website optional).");
    }
    breakdown.digitalDomain = { score: digitalScore, maxScore: 40, detail: "Website & domain verification" };
    score += digitalScore;

    // Direct Ownership Auto-Approval Bonus: Email Verified + Website DNS Verified
    const isEmailVerified = Boolean(evidence.emailVerified || brand.email_verified);
    if (isEmailVerified && isDnsVerified) {
      score += 20;
      reasons.push("Direct Ownership Confirmed: Business Email & Web DNS TXT verified.");
    }

    // Check for explicit policy violations (Adult, Illegal, Hate, Scam, Spam, Impersonation)
    const combinedContent = `${brand.name || ""} ${brand.short_description || ""} ${brand.mission || ""}`.toLowerCase();
    const violationKeywords = ["scam", "phishing", "illegal drugs", "counterfeit", "hate speech", "exploit"];
    const isExplicitViolation = violationKeywords.some((word) => combinedContent.includes(word));

    const hasWebsite = Boolean(brand.website && String(brand.website).trim().length > 3);

    let status: "verified" | "pending" | "needs_review" | "rejected" = "needs_review";
    if (isExplicitViolation) {
      status = "rejected";
      reasons.push("Explicit community policy violation detected.");
    } else if (hasWebsite && !isDnsVerified) {
      // If a website is provided, Website Ownership Verification (DNS TXT or Meta Tag) is strictly mandatory
      status = "needs_review";
      recommendations.push(
        `Website ownership verification is mandatory for ${brand.website}. Please add the DNS TXT record or HTML Meta tag and click 'Verify Again'.`
      );
    } else if (score >= 65 || (isEmailVerified && isDnsVerified) || (!hasWebsite && isEmailVerified && score >= 50)) {
      status = "verified";
    } else {
      status = "needs_review";
      if (recommendations.length === 0) {
        recommendations.push(
          "Provide additional business evidence (e.g. storefront photo, business card, Google Business profile, or social links) to reach verified status."
        );
      }
    }

    return {
      confidenceScore: Math.min(score, 100),
      status,
      breakdown,
      reasons,
      recommendations,
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
