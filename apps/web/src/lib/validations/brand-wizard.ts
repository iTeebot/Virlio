import { z } from "zod";

export const step1BasicInfoSchema = z.object({
  name: z
    .string()
    .transform((s) => s.trim())
    .refine((s) => s.length >= 2, "Brand name must be at least 2 characters")
    .refine((s) => /[a-zA-Z]/.test(s), "Brand name must contain letters"),
  slug: z
    .string()
    .min(2, "Public username handle must be at least 2 characters")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Username can only contain lowercase letters, numbers, and hyphens"),
  industry: z.string().optional().default(""),
  sub_industry: z.string().optional().default(""),
  short_description: z.string().optional().default(""),
  country: z.string().optional().default(""),
  state_province: z.string().optional().default(""),
  city: z.string().optional().default(""),
  founded_year: z.union([z.number().int().min(1800).max(new Date().getFullYear()), z.string(), z.undefined(), z.null()]).optional(),
  employee_size: z.string().optional().default(""),
  business_type: z.string().optional().default(""),
});

export const step2BrandIdentitySchema = z.object({
  logo_url: z.string().optional().default(""),
  banner_url: z.string().optional().default(""),
  icon_url: z.string().optional().default(""),
  guidelines_pdf_url: z.string().optional().default(""),
  primary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color required").optional().default("#2563EB"),
  secondary_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color required").optional().default("#1E40AF"),
  accent_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color required").optional().default("#3B82F6"),
  dark_bg_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color required").optional().default("#0F172A"),
  light_bg_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Valid hex color required").optional().default("#F8FAFC"),
  custom_colors: z.array(z.object({ name: z.string(), hex: z.string() })).optional().default([]),
  palette_image_url: z.string().optional().default(""),
  typography: z.string().optional().default("Inter"),
  brand_style: z.string().optional().default("Modern"),
  brand_personality: z.array(z.string()).optional().default([]),
});

export const step3TargetAudienceSchema = z.object({
  target_age_groups: z.array(z.string()).optional().default([]),
  target_countries: z.array(z.string()).optional().default([]),
  target_languages: z.array(z.string()).optional().default([]),
  audience_interests: z.array(z.string()).max(25, "Maximum 25 interest tags allowed").optional().default([]),
  audience_description: z.string().optional().default(""),
  customer_type: z.string().optional().default(""),
  income_segment: z.string().optional().default(""),
});

export const step4ProductsServicesSchema = z.object({
  products: z.array(z.string()).max(50, "Maximum 50 products allowed").optional().default([]),
  services: z.array(z.string()).max(10, "Maximum 10 services allowed").optional().default([]),
  featured_products: z.array(z.string()).optional().default([]),
  best_seller: z.string().optional().default(""),
  price_range: z.string().optional().default(""),
  competitive_advantages: z.string().optional().default(""),
  usps: z.array(z.string()).max(25, "Maximum 25 Unique Selling Points allowed").optional().default([]),
  competitors: z.array(z.string()).max(10, "Maximum 10 competitors allowed").optional().default([]),
  things_customers_love: z.string().optional().default(""),
  things_customers_ask: z.array(z.string()).optional().default([]),
});

export const step5BrandVoiceSchema = z.object({
  brand_tone: z.string().optional().default(""),
  communication_style: z.string().optional().default(""),
  mission: z.string().optional().default(""),
  vision: z.string().optional().default(""),
  tagline: z.string().optional().default(""),
  words_we_love: z.array(z.string()).optional().default([]),
  words_we_avoid: z.array(z.string()).optional().default([]),
  topics_to_avoid: z.array(z.string()).optional().default([]),
  humor_allowed: z.boolean().optional().default(true),
  political_content: z.boolean().optional().default(false),
  religious_content: z.boolean().optional().default(false),
  sensitive_topics: z.boolean().optional().default(false),
  cta_style: z.string().optional().default(""),
  preferred_meme_style: z.string().optional().default(""),
  preferred_caption_length: z.string().optional().default(""),
  preferred_hashtag_style: z.string().optional().default(""),
});

const isValidOrEmptyUrl = z.string().refine((val) => {
  if (!val || val.trim() === "") return true;
  try {
    const url = val.startsWith("http://") || val.startsWith("https://") ? val : `https://${val}`;
    new URL(url);
    return true;
  } catch {
    return false;
  }
}, "Please enter a valid URL").optional().default("");

export const step6SocialPresenceSchema = z.object({
  website: isValidOrEmptyUrl,
  facebook: isValidOrEmptyUrl,
  instagram: isValidOrEmptyUrl,
  tiktok: isValidOrEmptyUrl,
  linkedin: isValidOrEmptyUrl,
  youtube: isValidOrEmptyUrl,
  pinterest: isValidOrEmptyUrl,
  threads: isValidOrEmptyUrl,
  x: isValidOrEmptyUrl,
  whatsapp_business: z.string().optional().default(""),
  google_business: isValidOrEmptyUrl,
  business_email: z.string().email("Invalid email address").or(z.string().length(0)).optional().default(""),
  business_phone: z.string().optional().default(""),
  email_verified: z.boolean().optional().default(false),
});

export const step7VerificationEvidenceSchema = z.object({
  storefront_photos: z.array(z.string()).optional().default([]),
  business_photos: z.array(z.string()).optional().default([]),
  business_card_url: z.string().optional().default(""),
  catalog_url: z.string().optional().default(""),
  menu_url: z.string().optional().default(""),
  invoice_url: z.string().optional().default(""),
  tax_registration_url: z.string().optional().default(""),
  company_registration_url: z.string().optional().default(""),
  dns_txt_record: z.string().optional().default(""),
  meta_tag: z.string().optional().default(""),
});

export const fullBrandWizardSchema = z.object({
  step1: step1BasicInfoSchema,
  step2: step2BrandIdentitySchema,
  step3: step3TargetAudienceSchema,
  step4: step4ProductsServicesSchema,
  step5: step5BrandVoiceSchema,
  step6: step6SocialPresenceSchema,
  step7: step7VerificationEvidenceSchema,
});

export type Step1BasicInfo = z.infer<typeof step1BasicInfoSchema>;
export type Step2BrandIdentity = z.infer<typeof step2BrandIdentitySchema>;
export type Step3TargetAudience = z.infer<typeof step3TargetAudienceSchema>;
export type Step4ProductsServices = z.infer<typeof step4ProductsServicesSchema>;
export type Step5BrandVoice = z.infer<typeof step5BrandVoiceSchema>;
export type Step6SocialPresence = z.infer<typeof step6SocialPresenceSchema>;
export type Step7VerificationEvidence = z.infer<typeof step7VerificationEvidenceSchema>;
export type FullBrandWizardData = z.infer<typeof fullBrandWizardSchema>;
