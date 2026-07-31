export type ServiceTierId = "starter" | "growth" | "enterprise";

export interface ServiceTier {
  id: ServiceTierId;
  name: string;
  tagline: string;
  priceDisplay: string;
  period: string;
  idealFor: string;
  popular?: boolean;
  features: string[];
  teebotScope: string;
  ctaText: string;
}

export interface ProfessionalServiceItem {
  id: string;
  title: string;
  category: "Web & Mobile" | "AI & Automation" | "Business Systems" | "Growth & Infrastructure";
  description: string;
  idealCustomer: string;
  expectedOutcome: string;
  iconName: string;
  priority: "High" | "Medium" | "Low";
}

export interface BrandAuditRecommendation {
  id: string;
  title: string;
  category: string;
  priority: "High" | "Medium" | "Low";
  impact: string;
  difficulty: "Low" | "Medium" | "High";
  reasoning: string;
  expectedOutcome: string;
  teebotServiceId: string;
  actionText: string;
}

export interface ConsultationRequestPayload {
  businessName: string;
  industry: string;
  currentWebsite?: string;
  requestedServices: string[];
  businessGoals: string;
  preferredTimeline: "Immediate (< 2 weeks)" | "1 Month" | "1-3 Months" | "Flexible";
  budgetRange?: string;
  country: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  additionalNotes?: string;
}

export interface RegionalPaymentConfig {
  region: "Pakistan" | "UAE" | "Global";
  gateways: string[];
  currencies: string[];
  description: string;
}

export const REGIONAL_PAYMENT_CONFIGS: Record<string, RegionalPaymentConfig> = {
  Pakistan: {
    region: "Pakistan",
    gateways: ["Easypaisa", "JazzCash", "Bank Transfer"],
    currencies: ["PKR"],
    description: "Instant mobile wallet and direct local bank wire transfers.",
  },
  UAE: {
    region: "UAE",
    gateways: ["Ziina", "Stripe", "Bank Transfer"],
    currencies: ["AED", "USD"],
    description: "Ziina payment links, Apple Pay, and local AED settlement.",
  },
  Global: {
    region: "Global",
    gateways: ["Stripe", "PayPal", "Wise"],
    currencies: ["USD", "EUR", "GBP"],
    description: "International credit cards, PayPal, and multi-currency wire transfers.",
  },
};
