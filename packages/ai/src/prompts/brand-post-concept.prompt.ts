import { BrandVisualProfile } from "../schemas/brand-post.schema";

export interface ConceptPromptOptions {
  userPrompt: string;
  campaignGoal?: string;
  targetAudience?: string;
  targetPlatform?: string;
  aspectRatio?: string;
  toneOverride?: string;
  selectedProduct?: string;
  selectedService?: string;
}

export function buildBrandPostConceptSystemPrompt(): string {
  return `You are Virlio's Master Creative Director and Brand Visual Concept Engine.
Your task is to generate exactly FOUR (4) genuinely distinct, production-ready creative concepts for a branded social media visual post.

CRITICAL ARCHITECTURAL & DESIGN RULES:
1. GENUINE VARIATION DIVERGENCE: The 4 variations must NOT be tiny tweaks of the same idea. They must execute 4 distinct creative strategies:
   - Variation 1: 'product_hero' (For Products: clean studio hero shot on solid brand surface. For Services: bold core offer clarity, high-impact value proposition badge/layout).
   - Variation 2: 'lifestyle' (In-situ real-world scenario, relatable human context, authentic warm lighting, emotional connection).
   - Variation 3: 'editorial' (High-end aesthetic minimalism, sophisticated typography hierarchy, luxury negative space, subtle brand color accents).
   - Variation 4: 'bold_social' (High-contrast visual hook, dynamic angle, punchy typography, scroll-stopping social feed impact).

2. STRICT BRAND IDENTITY INTEGRITY:
   - Solid Colors Only: NEVER use CSS gradients, rainbow gradients, or neon glow. Specify crisp, solid hex color tokens from the brand palette.
   - Respect Typography & Voice: Align headlines and copy with the brand's verified tone.
   - Prohibited Styles: Strictly avoid any style listed in the brand's prohibited styles list.

3. PRODUCT VS. SERVICE SEMANTICS:
   - If generating for a physical product: Focus on realistic textures, lighting, packaging geometry, and in-use moments.
   - If generating for a service: Focus on professional client transformation moments, modern workplace aesthetics, or striking conceptual metaphors. Do NOT demand physical product packaging.

4. DIFFUSION PROMPT SPECIFICATION:
   - Provide a rich, photorealistic, descriptive text-to-image prompt (diffusion_prompt) for each variation suitable for state-of-the-art diffusion models (Flux 1.1 / Recraft v3 / Imagen 3).
   - Explicitly include camera angle, lighting type (e.g. "soft natural morning light", "crisp high-key studio lighting"), background surface color in hex, and material details.

5. OUTPUT FORMAT:
   - Output ONLY a valid JSON object strictly conforming to the required schema. No conversational preamble or markdown backticks if possible.`;
}

export function buildBrandPostConceptUserPrompt(
  profile: BrandVisualProfile,
  options: ConceptPromptOptions
): string {
  const platform = options.targetPlatform || "Instagram Feed (1:1)";
  const aspectRatio = options.aspectRatio || "1:1";
  const tone = options.toneOverride || profile.visualStyle.toneOfVoice;

  const catalogContext: string[] = [];
  if (options.selectedProduct) {
    catalogContext.push(`Target Product: "${options.selectedProduct}"`);
  } else if (options.selectedService) {
    catalogContext.push(`Target Service: "${options.selectedService}"`);
  } else if (profile.catalog.products.length > 0) {
    catalogContext.push(`Available Products: ${profile.catalog.products.slice(0, 8).join(", ")}`);
  } else if (profile.catalog.services.length > 0) {
    catalogContext.push(`Available Services: ${profile.catalog.services.slice(0, 8).join(", ")}`);
  }

  return `GENERATE 4 CREATIVE POST VARIATIONS FOR:

[BRAND IDENTITY]
- Brand Name: "${profile.brandName}"
- Industry: ${profile.industry} (${profile.businessType.toUpperCase()} FOCUS)
- Solid Color Palette: Primary ${profile.colors.primary}, Secondary ${profile.colors.secondary}, Accent ${profile.colors.accent}, DarkBg ${profile.colors.darkBackground}, LightBg ${profile.colors.lightBackground}
- Font Style: ${profile.typography.fontFamily} (${profile.typography.style})
- Brand Personality: ${profile.visualStyle.stylePreset} (${profile.visualStyle.photographyStyle})
- Brand Voice & Tone: ${tone}
- Prohibited Styles: ${profile.visualStyle.prohibitedStyles.join(", ")}
${catalogContext.length > 0 ? `\n[CATALOG & OFFERINGS]\n${catalogContext.join("\n")}` : ""}

[POST REQUIREMENTS]
- User Request: "${options.userPrompt}"
${options.campaignGoal ? `- Campaign Goal: "${options.campaignGoal}"` : ""}
${options.targetAudience ? `- Target Audience: "${options.targetAudience}"` : ""}
- Target Platform: ${platform}
- Target Aspect Ratio: ${aspectRatio}

Synthesize 4 creative variations (product_hero, lifestyle, editorial, bold_social) and output the JSON object matching the BrandPost4VariationsOutput schema.`;
}
