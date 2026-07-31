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
    slug: "programming",
    name: "Programming",
    description: "React, Node.js, Python, DevOps & Engineering Culture",
    iconName: "Code",
  },
  {
    id: "cat-2",
    slug: "marketing",
    name: "Marketing",
    description: "B2B SaaS, Paid Ads, Growth Channels & SEO",
    iconName: "Megaphone",
  },
  {
    id: "cat-3",
    slug: "restaurants",
    name: "Restaurants",
    description: "Food Delivery, Cafes, Dining & QR POS Menus",
    iconName: "Utensils",
  },
  {
    id: "cat-4",
    slug: "finance",
    name: "Finance",
    description: "Fintech, Stocks, Crypto & Tax Preparation",
    iconName: "DollarSign",
  },
  {
    id: "cat-5",
    slug: "gaming",
    name: "Gaming",
    description: "FPS, Esports, Streaming & Gaming Culture",
    iconName: "Gamepad2",
  },
  {
    id: "cat-6",
    slug: "startups",
    name: "Startups",
    description: "Fundraising, Product Launches & Pitch Decks",
    iconName: "Rocket",
  },
  {
    id: "cat-7",
    slug: "real-estate",
    name: "Real Estate",
    description: "Property Management, Mortgages & Listings",
    iconName: "Home",
  },
  {
    id: "cat-8",
    slug: "education",
    name: "Education",
    description: "Online Courses, EdTech & Learning Culture",
    iconName: "GraduationCap",
  },
  {
    id: "cat-9",
    slug: "healthcare",
    name: "Healthcare",
    description: "Wellness, Fitness, Clinics & Medical Tech",
    iconName: "Stethoscope",
  },
  {
    id: "cat-10",
    slug: "legal",
    name: "Legal",
    description: "Law Firms, Contracts & Compliance",
    iconName: "Scale",
  },
  {
    id: "cat-11",
    slug: "travel",
    name: "Travel",
    description: "Hotels, Aviation, Booking & Tourism",
    iconName: "Compass",
  },
  {
    id: "cat-12",
    slug: "technology",
    name: "Technology",
    description: "AI Models, Cloud Computing & Hardware",
    iconName: "Cpu",
  },
];
