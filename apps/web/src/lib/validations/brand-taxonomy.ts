import { validateSafetyAndProfanity, normalizeTitleCase } from "./safety-filter";

export { validateSafetyAndProfanity, normalizeTitleCase };
export const normalizeTaxonomyName = normalizeTitleCase;

/**
 * Predefined Business Types -> Industry -> Sub-Industries Mapping
 */
export const TAXONOMY_MAP: Record<string, Record<string, string[]>> = {
  Software: {
    Technology: [
      "B2B SaaS",
      "AI & Machine Learning",
      "Developer Tools",
      "Cybersecurity",
      "Mobile Apps",
      "Cloud Infrastructure",
      "Fintech Software",
      "Healthtech",
      "Edtech",
    ],
    Software: [
      "B2B SaaS",
      "Enterprise Software",
      "API & Developer Tools",
      "Automation Software",
      "Analytics & BI",
    ],
  },
  Restaurant: {
    "Food & Beverage": [
      "Pizza & Fast Food",
      "Cafe & Specialty Coffee",
      "Bakery & Pastry",
      "Fine Dining",
      "Desserts & Ice Cream",
      "Steakhouse & Grill",
      "Seafood",
      "Asian & Fusion Cuisine",
      "Food Truck",
    ],
  },
  Retail: {
    "E-Commerce & Retail": [
      "Direct-to-Consumer (D2C)",
      "Apparel & Accessories",
      "Home & Living",
      "Electronics & Gadgets",
      "Beauty & Cosmetics",
      "Sporting Goods",
    ],
    "Fashion & Apparel": [
      "Streetwear",
      "Luxury Fashion",
      "Activewear / Sportswear",
      "Footwear & Sneakers",
      "Jewelry & Accessories",
      "Sustainable Fashion",
    ],
  },
  Agency: {
    "Marketing & Advertising": [
      "Digital Marketing",
      "Social Media Agency",
      "SEO & Content Strategy",
      "Creative & Graphic Design",
      "PR & Communications",
      "Performance Marketing",
      "Video Production",
    ],
    "Consulting & Professional Services": [
      "Management Consulting",
      "IT & Cloud Consulting",
      "Brand Strategy & Identity",
      "Financial Advisory",
    ],
  },
  Healthcare: {
    "Healthcare & Wellness": [
      "Medical Clinic & Practice",
      "Dental Care",
      "Mental Health & Therapy",
      "Fitness & Gym Studio",
      "Nutrition & Supplements",
      "Pharmacy & MedTech",
      "Skincare & Spa",
    ],
  },
  Education: {
    "Education & Learning": [
      "Online Learning & EdTech",
      "Tutoring & Test Prep",
      "Language Institute",
      "Vocational Training",
      "K-12 Education",
      "Higher Education",
    ],
  },
  "Real Estate": {
    "Real Estate & Property": [
      "Residential Real Estate",
      "Commercial Property",
      "Property Management",
      "Real Estate Investment",
      "Vacation & Short-Term Rentals",
    ],
  },
  Construction: {
    "Construction & Engineering": [
      "Residential Contracting",
      "Commercial Building",
      "Interior Design & Fitout",
      "Architecture & Design",
      "Civil Engineering",
    ],
  },
};

export function getSubIndustries(businessType: string, industry: string): string[] {
  if (TAXONOMY_MAP[businessType] && TAXONOMY_MAP[businessType][industry]) {
    return TAXONOMY_MAP[businessType][industry];
  }

  return [
    "General Services",
    "Specialty Products",
    "B2B Solutions",
    "Consumer Offerings",
    "Digital & Online",
  ];
}
