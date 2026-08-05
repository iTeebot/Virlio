import type { BrandContext } from "./brand-context-builder";
import type { RankedTemplate } from "./template-ranking-engine";

export const PROMPT_VERSION = "MEME_PROMPT_V2";

export interface PromptOptions {
  topic: string;
  count: number;
  campaignName?: string;
  targetAudience?: string;
  marketingGoal?: string;
  tone?: string;
  cta?: string;
  additionalNotes?: string;
}

/**
 * Dedicated prompt construction engine for meme generation.
 * Handles both classic top/bottom memes and coordinate-based region labeling.
 */
export function buildMemeGenerationPrompt(
  brandContext: BrandContext,
  rankedTemplates: RankedTemplate[],
  options: PromptOptions
): string {
  const templateList = rankedTemplates
    .map((t, i) => {
      const profile = t.aiGenerationProfile;
      const layout = profile?.textLayout || t.textLayout || "top_bottom";
      
      let regionsInfo = "";
      if (layout === "regions" && profile && Array.isArray(profile.regions)) {
        const regionStrings = profile.regions
          .map((r: any) => `"${r.id}" (Description: ${r.description || r.name})`)
          .join(", ");
        regionsInfo = ` | REGIONS TO POPULATE: [${regionStrings}]`;
      }

      const profileStr = profile
        ? `| Layout: ${layout} | Style: ${profile.memeStyle || "General"} | Emotion: ${profile.emotion || "Neutral"} | Humor: ${profile.humorType || "General"} | Caption Length: ${profile.preferredCaptionLength || "short"}`
        : `| Layout: ${layout}`;

      return `${i + 1}. ID: "${t.id}" | Title: "${t.title}" | Category: ${t.category || "General"} | Tags: [${t.tags.join(", ")}] | Description: "${t.description || "N/A"}" | AI Summary: "${t.aiSummary || "N/A"}" | OCR Text: "${t.ocrText || ""}" ${profileStr}${regionsInfo} | Relevance: ${t.relevanceScore}/100`;
    })
    .join("\n");

  const brandVoiceStr = brandContext.brandVoice
    ? `\nBrand Voice Guidelines: ${JSON.stringify(brandContext.brandVoice)}`
    : "";

  const audienceStr = brandContext.audience
    ? `\nTarget Audience Profile: ${JSON.stringify(brandContext.audience)}`
    : "";

  const restrictionsStr = brandContext.restrictions
    ? `\nContent Restrictions/Guidelines: ${JSON.stringify(brandContext.restrictions)}`
    : "";

  const campaignStr = options.campaignName
    ? `\nCampaign: "${options.campaignName}"`
    : "";

  const targetAudienceStr = options.targetAudience
    ? `\nTarget Audience for this Generation: "${options.targetAudience}"`
    : "";

  const goalStr = options.marketingGoal
    ? `\nMarketing Goal: ${options.marketingGoal}`
    : "";

  const toneStr = options.tone
    ? `\nDesired Tone: ${options.tone}`
    : "";

  const ctaStr = options.cta
    ? `\nCall-to-Action to incorporate: "${options.cta}"`
    : "";

  const notesStr = options.additionalNotes
    ? `\nAdditional Instructions: ${options.additionalNotes}`
    : "";

  return `You are Virlio's Meme Generation Engine, an expert at creating viral branded memes.

BRAND CONTEXT:
- Brand Name: "${brandContext.name}"
- Industry: ${brandContext.industry}${brandContext.subIndustry ? ` (${brandContext.subIndustry})` : ""}
- Country: ${brandContext.country}
- Language: ${brandContext.language}
- Description: "${brandContext.description}"${brandVoiceStr}${audienceStr}${restrictionsStr}

GENERATION REQUEST:
- Topic: "${options.topic}"${campaignStr}${targetAudienceStr}${goalStr}${toneStr}${ctaStr}${notesStr}

AVAILABLE TEMPLATES (pre-ranked by relevance):
${templateList}

TASK:
Select the ${options.count} best templates from the list above and write clever, funny captions for each.

RULES:
1. You MUST select templates only from the provided list. Use their exact "ID" values.
2. Each meme MUST have a "text_layout" that matches the template's layout field. If the template says "regions", use "regions". If "top_bottom", use "top_bottom", etc.
3. If a template has layout "regions" and a list of REGIONS TO POPULATE (e.g., ["left_button", "right_button"]), you MUST leave "top_text" and "bottom_text" as null, and instead write a JSON object in "region_captions" mapping each region ID to its text overlay.
4. For non-regions layouts, "region_captions" MUST be null, and you MUST populate "top_text" and/or "bottom_text" instead.
5. Captions must be brand-appropriate, culturally aware, and highly relevant to the topic.
6. Each caption should be concise — aim for maximum humor in minimum words.
7. Vary the humor styles across the ${options.count} memes (e.g., sarcasm, irony, relatability, absurdism).
8. Do NOT mention the brand name in every caption — be subtle when appropriate.
9. Hashtags should be relevant and include 1-2 branded tags.
10. If content restrictions exist, strictly follow them.
11. The "confidence" score should reflect how well the template-caption combination fits the brand and topic.

OUTPUT FORMAT:
Return ONLY a valid JSON object with this exact structure:
{
  "memes": [
    {
      "template_id": "exact-uuid-from-list",
      "reason_selected": "Why this template was chosen for this topic",
      "title": "A concise, natural 3-8 word title for this meme. Must be human readable, relevant to the joke and template. NO quotes, NO emojis, NO hashtags, NO generic titles like 'Untitled' or 'Generated Meme'. (e.g. 'When Monday Meetings Attack', 'Startup Reality Check')",
      "description": "An informative 40-100 word SEO-friendly paragraph explaining the joke and context. Mention the topic, subtle industry/audience context naturally without keyword stuffing or robotic phrasing. NO emojis, NO markdown.",
      "top_text": "Top caption text or null if layout is 'regions' or doesn't use it",
      "bottom_text": "Bottom caption text or null if layout is 'regions' or doesn't use it",
      "region_captions": { "region_id_1": "caption text 1", "region_id_2": "caption text 2" } or null,
      "text_layout": "top_only|bottom_only|top_bottom|top_middle|middle_only|no_text|regions",
      "confidence": 85,
      "tone": "witty|sarcastic|wholesome|professional|absurd|deadpan|ironic",
      "hashtags": ["#Tag1", "#Tag2"]
    }
  ]
}

Do NOT wrap the JSON in markdown code blocks. Output valid JSON only.`;
}
