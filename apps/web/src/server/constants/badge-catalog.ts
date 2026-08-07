export interface SystemBadgeDef {
  slug: string;
  name: string;
  category: "Special" | "Community" | "Trust & Safety" | "Milestones" | "Generation" | "Virality";
  description: string;
  icon_url: string;
}

export const OFFICIAL_SYSTEM_BADGES: Record<string, SystemBadgeDef> = {
  "early-adopter": {
    slug: "early-adopter",
    name: "Early Adopter",
    category: "Special",
    description: "Recognizes pioneer creators and brands who join Virlio during the initial platform launch phase.",
    icon_url: "/images/badges/badge_Early_adopter.png",
  },
  "top-contributor": {
    slug: "top-contributor",
    name: "Top Contributor",
    category: "Community",
    description: "Awarded to elite template creators whose submissions consistently drive high engagement and downloads.",
    icon_url: "/images/badges/badge_Top_Contributer.png",
  },
  "verified-brand": {
    slug: "verified-brand",
    name: "Verified Brand",
    category: "Trust & Safety",
    description: "Official verification mark confirming legitimate business ownership and domain authenticity.",
    icon_url: "/images/badges/badge_Verified_Brand.png",
  },
  "100-templates": {
    slug: "100-templates",
    name: "100 Templates Uploaded",
    category: "Milestones",
    description: "Celebrates creators who have contributed 100 high-quality, AI-approved meme templates to the community.",
    icon_url: "/images/badges/badge_100Templates.png",
  },
  "500-templates": {
    slug: "500-templates",
    name: "500 Templates Uploaded",
    category: "Milestones",
    description: "A major milestone badge for prolific creators supplying the platform with 500 approved template formats.",
    icon_url: "/images/badges/badge_500_Templates.png",
  },
  "1000-templates": {
    slug: "1000-templates",
    name: "1,000 Templates Uploaded",
    category: "Milestones",
    description: "Exclusive badge reserved for legendary creators who have reached 1,000 published meme templates.",
    icon_url: "/images/badges/badge_1000_Templates.png",
  },
  "100-memes": {
    slug: "100-memes",
    name: "100 Memes Generated",
    category: "Generation",
    description: "Awarded to active brands and creators who have rendered and generated 100 marketing memes.",
    icon_url: "/images/badges/badge_100Memes.png",
  },
  "1000-memes": {
    slug: "1000-memes",
    name: "1,000 Memes Generated",
    category: "Generation",
    description: "Recognizes high-velocity brand marketing teams that have produced 1,000 AI-powered memes.",
    icon_url: "/images/badges/badge_1000_Memes.png",
  },
  "10k-memes": {
    slug: "10k-memes",
    name: "10,000 Memes Generated",
    category: "Generation",
    description: "The ultimate generation milestone badge representing 10,000 high-converting brand memes produced.",
    icon_url: "/images/badges/badge_10kMemes.png",
  },
  "community-favorite": {
    slug: "community-favorite",
    name: "Community Favorite",
    category: "Virality",
    description: "Awarded when your uploaded template or meme receives exceptional community upvotes and bookmarks.",
    icon_url: "/images/badges/badge_Community_Favorite.png",
  },
  "ai-approved": {
    slug: "ai-approved",
    name: "AI Approved",
    category: "Trust & Safety",
    description: "Signifies flawless compliance history with 100% automated AI guardrail approval rating.",
    icon_url: "/images/badges/badge_AI_Approved.png",
  },
  "trend-setter": {
    slug: "trend-setter",
    name: "Trend Setter",
    category: "Virality",
    description: "Granted to creators who submit a new template format that goes viral on public leaderboards within 48 hours.",
    icon_url: "/images/badges/badge_Trend_Setter.png",
  },
  "hall-of-fame": {
    slug: "hall-of-fame",
    name: "Hall of Fame",
    category: "Special",
    description: "The highest honor on Virlio. Inducts top 10 historical contributors and all-time leading brands.",
    icon_url: "/images/badges/badge_Hall_of_Fame.png",
  },
};

export const ALLOWED_BADGE_SLUGS = new Set(Object.keys(OFFICIAL_SYSTEM_BADGES));
