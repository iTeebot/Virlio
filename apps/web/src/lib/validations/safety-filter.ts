/**
 * Centralized Safety & Moderation Filter
 * Reusable validator for profanity, NSFW content, adult terms, hate speech, illegal organizations, and spam.
 */

// Banned term lists categorized
const ADULT_NSFW_TERMS = [
  "porn", "nsfw", "adult", "sex", "nude", "naked", "xxx", "hentai", "erotic",
  "strip", "escort", "orgasm", "penis", "vagina", "dildo", "pussy", "cock",
  "dick", "boobs", "tit", "slut", "whore"
];

const PROFANITY_TERMS = [
  "fuck", "shit", "bitch", "bastard", "asshole", "cunt", "dickhead", "motherfucker"
];

const HATE_SPEECH_TERMS = [
  "nazi", "hitler", "klan", "kkk", "nigger", "faggot", "chink", "spic", "terrorist",
  "isis", "supremacist"
];

const SPAM_ILLEGAL_TERMS = [
  "viagra", "casino", "gambling", "betting", "lottery", "free-money", "pyramid-scheme",
  "cocaine", "heroin", "meth", "weed-seller", "hacked-account", "buy-followers"
];

export const ALL_BANNED_TERMS = [
  ...ADULT_NSFW_TERMS,
  ...PROFANITY_TERMS,
  ...HATE_SPEECH_TERMS,
  ...SPAM_ILLEGAL_TERMS,
];

export interface SafetyCheckResult {
  isValid: boolean;
  reason?: string;
  matchedTerm?: string;
}

/**
 * Validates text against centralized safety policies (NSFW, profanity, hate speech, spam).
 */
export function validateSafetyAndProfanity(text: string): SafetyCheckResult {
  if (!text || !text.trim()) {
    return { isValid: false, reason: "Text cannot be empty." };
  }

  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();

  // 1. Minimum length requirement
  if (trimmed.length < 2) {
    return { isValid: false, reason: "Must be at least 2 characters long." };
  }

  // 2. Must contain letters (cannot consist purely of numbers or symbols)
  if (!/[a-zA-Z]/.test(trimmed)) {
    return { isValid: false, reason: "Must contain letters, not only numbers or symbols." };
  }

  // 3. Scan for banned terms using word boundary / substring matching
  for (const term of ALL_BANNED_TERMS) {
    // Regex for word boundary or substring match
    const regex = new RegExp(`\\b${term}\\b|${term}`, "i");
    if (regex.test(lower)) {
      return {
        isValid: false,
        reason: "Contains forbidden, offensive, or inappropriate content.",
        matchedTerm: term,
      };
    }
  }

  return { isValid: true };
}

/**
 * Normalizes custom inputs to clean Title Case (trimming extra whitespace)
 */
export function normalizeTitleCase(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/(^\w{1})|(\s+\w{1})/g, (letter) => letter.toUpperCase());
}
