export interface PredefinedCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
}

export const PREDEFINED_CATEGORIES: PredefinedCategory[] = [
  {
    id: "cat-1",
    slug: "viral-trends",
    name: "Viral Trends & Formats",
    description: "Trending Internet Reactions, Classic Meme Formats & Viral Formats",
    iconName: "Sparkles",
  },
  {
    id: "cat-2",
    slug: "marketing-saas",
    name: "Marketing & SaaS",
    description: "B2B SaaS, Growth Marketing, Product Launches & Brand Campaigns",
    iconName: "Megaphone",
  },
  {
    id: "cat-3",
    slug: "pop-culture",
    name: "Pop Culture & Movies",
    description: "TV Shows, Movies, Celebrity Reactions & Music Memes",
    iconName: "Film",
  },
  {
    id: "cat-4",
    slug: "corporate-life",
    name: "Work & Corporate Life",
    description: "Office Culture, Remote Work, Meetings, HR Humor & Freelancing",
    iconName: "Briefcase",
  },
  {
    id: "cat-5",
    slug: "finance-crypto",
    name: "Finance & Crypto",
    description: "Trading, Crypto, Stocks, Fintech, Economy & Bull/Bear Humor",
    iconName: "DollarSign",
  },
  {
    id: "cat-6",
    slug: "gaming-esports",
    name: "Gaming & Esports",
    description: "FPS, Streaming, Twitch Culture, RPGs & Gamer Reactions",
    iconName: "Gamepad2",
  },
  {
    id: "cat-7",
    slug: "ecommerce-retail",
    name: "Ecommerce & DTC Brands",
    description: "DTC Brands, Online Shopping, Unboxing, Discounts & Customer Support",
    iconName: "ShoppingBag",
  },
  {
    id: "cat-8",
    slug: "food-lifestyle",
    name: "Food & Restaurants",
    description: "Food Delivery, Cafes, Dining, Coffee & Foodie Culture",
    iconName: "Utensils",
  },
  {
    id: "cat-9",
    slug: "tech-ai",
    name: "Tech & AI",
    description: "Artificial Intelligence, Tech Founders, Gadgets & Future Tech",
    iconName: "Cpu",
  },
  {
    id: "cat-10",
    slug: "startups",
    name: "Startups & Founders",
    description: "Pitch Decks, Fundraising, MVP Launches & Hustle Culture",
    iconName: "Rocket",
  },
  {
    id: "cat-11",
    slug: "travel-hospitality",
    name: "Travel & Hotels",
    description: "Vacations, Aviation, Airbnb, Hotel Reviews & Digital Nomads",
    iconName: "Compass",
  },
  {
    id: "cat-12",
    slug: "fitness-health",
    name: "Fitness & Wellness",
    description: "Gym Culture, Workout Routines, Health & Wellness Jokes",
    iconName: "Dumbbell",
  },
];
