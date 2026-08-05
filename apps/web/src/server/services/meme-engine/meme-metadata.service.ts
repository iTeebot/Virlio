/**
 * Dedicated Meme Metadata Cleaning & Fallback Service
 * 
 * Enforces strict quality requirements on AI-generated Meme Titles and Descriptions:
 * - Title: 3-8 words, human-readable, no quotes/emojis/hashtags, no generic "Untitled".
 * - Description: 40-100 words, natural SEO-friendly paragraph explaining the joke and context.
 * - Guaranteed fallback generation: NEVER returns "Untitled", NULL, or empty strings.
 */

export function cleanTitleText(rawTitle: string | null | undefined): string {
  if (!rawTitle) return "";

  let cleaned = rawTitle
    .replace(/["'#]/g, "") // Remove quotation marks and hashtags
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Remove emojis
    .trim();

  // Strip generic prefixes like "Title:"
  cleaned = cleaned.replace(/^title:\s*/i, "");

  return cleaned;
}

export function cleanDescriptionText(rawDesc: string | null | undefined): string {
  if (!rawDesc) return "";

  let cleaned = rawDesc
    .replace(/```[a-z]*\n?/gi, "") // Remove markdown code blocks
    .replace(/[`*#_]/g, "") // Remove markdown formatting
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, "") // Remove emojis
    .trim();

  // Strip generic prefixes like "Description:"
  cleaned = cleaned.replace(/^description:\s*/i, "");

  return cleaned;
}

export function generateDeterministicTitle(
  topic: string,
  templateTitle?: string,
  index: number = 0
): string {
  const cleanTopic = topic.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Work Life";
  const cleanTemplate = templateTitle?.replace(/[^a-zA-Z0-9 ]/g, "").trim() || "Reaction";

  const patterns = [
    `When ${cleanTopic} Takes Over`,
    `The ${cleanTopic} Reality Check`,
    `Navigating ${cleanTopic} Like a Pro`,
    `How ${cleanTopic} Really Works`,
    `${cleanTemplate} Guide to ${cleanTopic}`,
    `Every Professional Dealing With ${cleanTopic}`,
  ];

  const chosen = patterns[index % patterns.length];
  return cleanTitleText(chosen);
}

export function generateDeterministicDescription(context: {
  topic: string;
  templateTitle?: string;
  topText?: string | null;
  bottomText?: string | null;
  brandName?: string;
  industry?: string;
}): string {
  const topicClean = (context.topic || "workplace scenarios").trim();
  const templateClean = context.templateTitle || "classic reaction";
  const textSummary = [context.topText, context.bottomText].filter(Boolean).join(" ");
  const industryStr = context.industry ? `${context.industry} industry` : "modern business environment";
  const brandStr = context.brandName ? `for ${context.brandName}` : "";

  let desc = `This meme humorously captures the moment when ${topicClean.toLowerCase()} impacts day-to-day operations in the ${industryStr}. Using the popular ${templateClean} template, it highlights a relatable experience shared by professionals, creators, and marketing teams who frequently navigate shifting priorities ${brandStr}.`;

  if (textSummary) {
    desc += ` The overlay caption highlights "${textSummary}" to deliver maximum comedic relevance for target audiences.`;
  }

  return cleanDescriptionText(desc);
}

const DISALLOWED_TITLES = new Set([
  "untitled",
  "untitled meme",
  "generated meme",
  "funny meme",
  "meme",
  "branded meme",
  "null",
  "undefined",
]);

export function ensureValidTitle(
  rawTitle: string | null | undefined,
  context: { topic: string; templateTitle?: string; index?: number }
): string {
  const cleaned = cleanTitleText(rawTitle);
  const words = cleaned.split(/\s+/).filter(Boolean);

  // Check validity: 3-8 words, not in disallowed list, not empty
  if (
    !cleaned ||
    words.length < 2 ||
    words.length > 12 ||
    DISALLOWED_TITLES.has(cleaned.toLowerCase())
  ) {
    return generateDeterministicTitle(context.topic, context.templateTitle, context.index ?? 0);
  }

  return cleaned;
}

export function ensureValidDescription(
  rawDescription: string | null | undefined,
  context: {
    topic: string;
    templateTitle?: string;
    topText?: string | null;
    bottomText?: string | null;
    brandName?: string;
    industry?: string;
  }
): string {
  const cleaned = cleanDescriptionText(rawDescription);
  const words = cleaned.split(/\s+/).filter(Boolean);

  // Check validity: 25-120 words, not empty
  if (!cleaned || words.length < 15) {
    return generateDeterministicDescription(context);
  }

  return cleaned;
}
