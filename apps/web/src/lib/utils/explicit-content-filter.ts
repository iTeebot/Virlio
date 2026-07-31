/**
 * Maximum Hardcoded Explicit & Adult Content Filters for Categories and User Submissions.
 * Strictly prevents creation of explicit, pornographic, violent, hateful, or illegal category names.
 */

const EXPLICIT_ADULT_TERMS = [
  // Nudity & Sexual Content
  "nsfw", "adult", "porn", "porno", "pornography", "xxx", "sex", "sexual", "sexy", "erotic",
  "erotica", "nude", "nudity", "naked", "boob", "boobs", "tits", "breast", "breasts",
  "vagina", "penis", "dick", "cock", "pussy", "ass", "butt", "anal", "blowjob", "handjob",
  "cum", "orgasm", "fetish", "bdsm", "hentai", "ecchi", "milf", "dilf", "camgirl", "onlyfans",
  "strip", "stripper", "prostitute", "escort", "escorts", "escortservice", "playboy", "xvideo",
  "redtube", "pornhub", "xhamster", "brazzers", "naughty", "kinky", "slut", "whore", "bitch",

  // Violence, Gore & Harm
  "gore", "blood", "kill", "killer", "suicide", "murder", "torture", "decapitate", "execution",
  "behead", "snuff", "mutilate", "dismember", "terrorist", "terrorism", "bomb", "explosive",

  // Hate Speech & Extremism
  "nigger", "nigga", "faggot", "fag", "kike", "spic", "chink", "retard", "nazi", "hitler",
  "swastika", "whitepower", "supremacist", "klan", "kkk", "jihad", "isis",

  // Illegal Activity & Drugs
  "cocaine", "heroine", "meth", "ecstasy", "fentanyl", "weed", "marijuana", "cannabis", "dealer",
  "hitman", "darknet", "blackmarket", "carding", "stolen", "hack", "exploit", "malware",
];

/**
 * Normalizes string by expanding common leetspeak substitutions.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/@/g, "a")
    .replace(/[$]/g, "s")
    .replace(/!/g, "i")
    .replace(/1/g, "i")
    .replace(/3/g, "e")
    .replace(/0/g, "o")
    .replace(/5/g, "s")
    .replace(/7/g, "t")
    .replace(/[^a-z0-9]/g, ""); // strip non-alphanumeric
}

export interface ContentFilterResult {
  isExplicit: boolean;
  reason?: string;
  matchedTerm?: string;
}

export function validateCategoryContent(input: string): ContentFilterResult {
  if (!input || input.trim().length === 0) {
    return { isExplicit: false };
  }

  const rawClean = input.toLowerCase().trim();
  const normalized = normalizeText(input);

  for (const term of EXPLICIT_ADULT_TERMS) {
    const termNormalized = normalizeText(term);

    // Direct match or normalized substring match
    if (
      rawClean.includes(term) ||
      normalized.includes(termNormalized) ||
      rawClean.split(/[\s_\-]+/).includes(term)
    ) {
      return {
        isExplicit: true,
        reason: "Category contains inappropriate or adult-restricted language.",
        matchedTerm: term,
      };
    }
  }

  return { isExplicit: false };
}
