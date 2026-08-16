import assert from "node:assert";
import {
  BrandVisualProfileSchema,
  BrandPost4VariationsOutputSchema,
  BrandVisualProfile,
  buildBrandPostConceptSystemPrompt,
  buildBrandPostConceptUserPrompt,
} from "@virlio/ai";

async function runBrandPostEngineTests() {
  console.log("🧪 Running Brand Visual Profile & 4-Variation Concept Engine Tests...");

  // Test 1: BrandVisualProfileSchema Validation
  const validProductProfile: BrandVisualProfile = {
    brandId: "123e4567-e89b-12d3-a456-426614174000",
    brandName: "Kinetix Audio",
    industry: "Consumer Electronics",
    businessType: "product",
    colors: {
      primary: "#2563EB",
      secondary: "#1E40AF",
      accent: "#F59E0B",
      darkBackground: "#0F172A",
      lightBackground: "#F8FAFC",
      paletteUsageRule: "Use crisp solid colors. NEVER use CSS gradients.",
    },
    typography: {
      fontFamily: "Space Grotesk",
      style: "Technical Sans",
    },
    logo: {
      url: "https://res.cloudinary.com/virlio/image/upload/v1/logo.png",
      publicId: "kinetix_logo",
      usageRule: "Top-left placement with padding",
    },
    visualStyle: {
      stylePreset: "Crisp Technical",
      photographyStyle: "Matte black studio pedestal with sharp rim lighting",
      compositionPreference: "Centered hero with negative space",
      toneOfVoice: "Bold & Technical",
      prohibitedStyles: ["gradients", "neon glow", "low contrast"],
      prohibitedColors: [],
    },
    catalog: {
      hasProducts: true,
      hasServices: false,
      products: ["Pulse Pro ANC Headphones", "AirFlow Wireless Earbuds"],
      services: [],
      featuredOfferings: ["Pulse Pro ANC Headphones"],
      usps: ["40h Battery", "Spatial Audio", "Active Noise Cancellation"],
      targetAudience: "Audiophiles and tech enthusiasts",
    },
  };

  const parsedProfile = BrandVisualProfileSchema.parse(validProductProfile);
  assert.strictEqual(parsedProfile.brandName, "Kinetix Audio");
  assert.strictEqual(parsedProfile.businessType, "product");

  console.log("✓ Test 1 Passed: BrandVisualProfileSchema accurately validates brand visual tokens");

  // Test 2: Service-Centric Brand Profile Handling
  const validServiceProfile: BrandVisualProfile = {
    brandId: "123e4567-e89b-12d3-a456-426614174001",
    brandName: "Apex Legal & Advisory",
    industry: "Legal & Consulting",
    businessType: "service",
    colors: {
      primary: "#1E293B",
      secondary: "#334155",
      accent: "#D97706",
      darkBackground: "#090D16",
      lightBackground: "#F8FAFC",
      paletteUsageRule: "Use crisp solid colors. NEVER use CSS gradients.",
    },
    typography: {
      fontFamily: "Playfair Display",
      style: "Editorial Serif",
    },
    logo: {
      url: null,
      usageRule: "Integrate brand name into typographic headline",
    },
    visualStyle: {
      stylePreset: "Prestigious Editorial",
      photographyStyle: "Modern glass office consultation in natural afternoon light",
      compositionPreference: "Sophisticated asymmetrical layout",
      toneOfVoice: "Authoritative & Refined",
      prohibitedStyles: ["gradients", "cartoonish", "informal memes"],
      prohibitedColors: [],
    },
    catalog: {
      hasProducts: false,
      hasServices: true,
      products: [],
      services: ["M&A Due Diligence", "Corporate Structuring", "IP Protection"],
      featuredOfferings: ["M&A Due Diligence"],
      usps: ["Top Tier Partners", "24h Response SLA", "Cross-border expertise"],
      targetAudience: "Enterprise founders and CFOs",
    },
  };

  const parsedService = BrandVisualProfileSchema.parse(validServiceProfile);
  assert.strictEqual(parsedService.businessType, "service");
  assert.strictEqual(parsedService.catalog.hasProducts, false);
  assert.strictEqual(parsedService.catalog.hasServices, true);

  console.log("✓ Test 2 Passed: Service-centric profiles successfully parsed without physical product requirements");

  // Test 3: Structured Prompt Generation
  const systemPrompt = buildBrandPostConceptSystemPrompt();
  assert.ok(systemPrompt.includes("GENUINE VARIATION DIVERGENCE"));
  assert.ok(systemPrompt.includes("product_hero"));
  assert.ok(systemPrompt.includes("lifestyle"));
  assert.ok(systemPrompt.includes("editorial"));
  assert.ok(systemPrompt.includes("bold_social"));
  assert.ok(systemPrompt.includes("NEVER use CSS gradients"));

  const userPrompt = buildBrandPostConceptUserPrompt(validProductProfile, {
    userPrompt: "Announce our Summer Flash Sale with bold energy",
    targetPlatform: "Instagram Feed (1:1)",
    aspectRatio: "1:1",
    selectedProduct: "Pulse Pro ANC Headphones",
  });

  assert.ok(userPrompt.includes("Kinetix Audio"));
  assert.ok(userPrompt.includes("Pulse Pro ANC Headphones"));
  assert.ok(userPrompt.includes("#2563EB"));
  assert.ok(userPrompt.includes("Space Grotesk"));

  console.log("✓ Test 3 Passed: Prompt construction embeds brand visual tokens, solid colors, and product context");

  // Test 4: 4-Variation Output Schema Validation
  const sample4VariationsOutput = {
    campaign_theme: "Summer Sound Unleashed",
    focus_summary: "Highlighting Pulse Pro ANC Headphones with 4 distinct visual approaches",
    variations: [
      {
        variation_index: 1,
        creative_direction: "product_hero" as const,
        direction_label: "Studio Hero Shot",
        concept_title: "Precision in Matte Black",
        concept_description: "Crisp studio hero shot of the Pulse Pro on a solid dark stone surface with sharp brand blue rim light.",
        visual_scene_description: "Studio product photography of matte black over-ear headphones on dark slate pedestal with #2563EB blue edge lighting.",
        diffusion_prompt: "Studio commercial product shot of matte black ANC headphones resting on dark charcoal pedestal, sharp rim lighting with solid #2563EB accents, 8k resolution, crisp texture.",
        negative_prompt: "gradients, blurry, low resolution, distorted logos",
        headline_text: "Pure Sound. Zero Distractions.",
        body_copy: "Summer Flash Sale: 25% Off Pulse Pro.",
        caption_copy: "Immerse yourself in high-fidelity sound this summer with Pulse Pro ANC. Tap the link in bio to shop the flash sale.",
        hashtags: ["#Audiophile", "#KinetixAudio", "#SummerSale"],
        suggested_layout: "center_hero" as const,
        color_accents_used: ["#2563EB", "#F59E0B"],
      },
      {
        variation_index: 2,
        creative_direction: "lifestyle" as const,
        direction_label: "In-Situ Lifestyle",
        concept_title: "City Commute Serenity",
        concept_description: "Young creative walking through sunny urban plaza wearing Pulse Pro headphones with natural warm golden lighting.",
        visual_scene_description: "Lifestyle photo of a creative professional wearing black headphones walking through sunlit city street, warm lighting, natural depth of field.",
        diffusion_prompt: "Authentic lifestyle photograph of person wearing sleek black headphones walking through modern sunlit city boulevard, warm morning lighting, genuine emotion.",
        negative_prompt: "gradients, oversaturated neon, fake pose",
        headline_text: "Your City. Your Soundtrack.",
        body_copy: "Escape the noise with active noise cancellation.",
        caption_copy: "Turn chaotic commutes into your private concert hall. Experience Kinetix Audio.",
        hashtags: ["#CityLife", "#WirelessAudio", "#Kinetix"],
        suggested_layout: "split_left_text" as const,
        color_accents_used: ["#F59E0B"],
      },
      {
        variation_index: 3,
        creative_direction: "editorial" as const,
        direction_label: "Minimalist Editorial Art",
        concept_title: "Sculptural Acoustics",
        concept_description: "High-fashion minimalist aesthetic framing the headband curve against a solid #0F172A backdrop.",
        visual_scene_description: "Editorial luxury framing of headphone geometry against solid deep navy surface with high negative space.",
        diffusion_prompt: "Luxury editorial product art, close-up abstract curve of premium aluminum headphone chassis against solid dark navy #0F172A background, soft studio chiaroscuro.",
        negative_prompt: "gradients, cheap textures, clutter",
        headline_text: "Acoustic Architecture.",
        body_copy: "Engineered for uncompromising clarity.",
        caption_copy: "Where acoustic engineering meets industrial design. Discover the craft behind Pulse Pro.",
        hashtags: ["#DesignExcellence", "#IndustrialDesign", "#Kinetix"],
        suggested_layout: "minimal_bottom_text" as const,
        color_accents_used: ["#0F172A"],
      },
      {
        variation_index: 4,
        creative_direction: "bold_social" as const,
        direction_label: "High-Contrast Social Graphic",
        concept_title: "Soundwaves Unbound",
        concept_description: "High-contrast dynamic diagonal composition with bold typography hook and electric amber accent blocks.",
        visual_scene_description: "Dynamic diagonal view of headphones floating mid-air with bold solid geometric amber block framing.",
        diffusion_prompt: "Dynamic high-contrast visual of floating headphones at 45 degree angle, bold solid background with #F59E0B amber geometric accent bar, sharp focus, vivid clarity.",
        negative_prompt: "gradients, rainbow colors, blurry",
        headline_text: "FLASH SALE: 25% OFF",
        body_copy: "Limited summer inventory available now.",
        caption_copy: "Summer sale is LIVE! Grab the award-winning Pulse Pro before stock runs out. Link in bio!",
        hashtags: ["#FlashSale", "#Deals", "#WirelessHeadphones"],
        suggested_layout: "clean_visual_only" as const,
        color_accents_used: ["#F59E0B", "#2563EB"],
      },
    ],
  };

  const parsedBatch = BrandPost4VariationsOutputSchema.parse(sample4VariationsOutput);
  assert.strictEqual(parsedBatch.variations.length, 4);
  assert.strictEqual(parsedBatch.variations[0].creative_direction, "product_hero");
  assert.strictEqual(parsedBatch.variations[1].creative_direction, "lifestyle");
  assert.strictEqual(parsedBatch.variations[2].creative_direction, "editorial");
  assert.strictEqual(parsedBatch.variations[3].creative_direction, "bold_social");

  console.log("✓ Test 4 Passed: 4-Variation output schema parses and validates 4 distinct creative concepts");
  console.log("🎉 All Brand Visual Profile & 4-Variation Concept Engine Tests Passed!");
}

runBrandPostEngineTests().catch((err) => {
  console.error("❌ Test Failed:", err);
  process.exit(1);
});
