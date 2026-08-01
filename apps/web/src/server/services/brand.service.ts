import { brandRepository } from "../repositories";
import { BrandAIService } from "@virlio/ai";
import type { Brand } from "@virlio/database/types";
import crypto from "crypto";

/* ---------------- LEGACY & BASIC COMPATIBILITY ---------------- */
export async function create(userId: string, data: Partial<Brand>) {
  return brandRepository.create({ ...data, owner_id: userId } as any);
}

export async function update(brandId: string, userId: string, data: Partial<Brand>) {
  const role = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!role || !["owner", "admin", "manager"].includes(role)) {
    throw new Error("Unauthorized: Insufficient permissions to modify brand settings");
  }
  await brandRepository.createAuditLog(brandId, userId, "UPDATE_BRAND_INFO", data);
  return brandRepository.update(brandId, data);
}

export async function getBySlug(slug: string) {
  return brandRepository.findBySlug(slug);
}

export async function getByOwner(userId: string) {
  return brandRepository.findUserAccessibleBrands(userId);
}

export async function requestVerification(brandId: string, userId: string, evidenceData: any) {
  const role = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!role || !["owner", "admin"].includes(role)) throw new Error("Unauthorized");

  const brand = await brandRepository.findById(brandId);
  if (!brand) throw new Error("Brand not found");

  const result = BrandAIService.calculateVerificationConfidence(brand, evidenceData);

  await brandRepository.upsertVerification(brandId, {
    confidence_score: result.confidenceScore,
    status: result.status,
    reasons: result.reasons,
    recommendations: result.recommendations,
    evidence_data: evidenceData,
  });

  await brandRepository.update(brandId, {
    verification_status: result.status as any,
    verification_reason: result.reasons.join("; "),
    ai_confidence_score: result.confidenceScore,
  });

  await brandRepository.createAuditLog(brandId, userId, "SUBMIT_VERIFICATION", { score: result.confidenceScore, status: result.status });

  return result;
}

export async function getPublicBrands(options: { limit?: number; offset?: number } = {}) {
  return brandRepository.findPublicBrands(options);
}

/* ---------------- DRAFT WIZARD ACTIONS ---------------- */
export async function getDraft(userId: string) {
  return brandRepository.getDraftByUser(userId);
}

export async function saveDraft(userId: string, currentStep: number, stepData: any) {
  return brandRepository.upsertDraft(userId, currentStep, stepData);
}

export async function clearDraft(userId: string) {
  return brandRepository.deleteDraftByUser(userId);
}

/* ---------------- AI ASSIST FUNCTIONS ---------------- */
export async function generateAISuggestion(step: number, field: string, currentValue: string, brandContext: Record<string, any>) {
  return BrandAIService.getFieldSuggestion({ step, field, currentValue, brandContext });
}

export async function extractLogoIdentity(logoUrl: string, brandContext: Record<string, any>) {
  return BrandAIService.extractIdentityFromLogo(logoUrl, brandContext);
}

export async function calculateVerificationConfidence(brandData: Record<string, any>, evidenceData: Record<string, any>) {
  return BrandAIService.calculateVerificationConfidence(brandData, evidenceData);
}

export async function generateReadinessReport(brandData: Record<string, any>, evidenceData: Record<string, any> = {}) {
  return BrandAIService.generateBrandReadinessReport(brandData, evidenceData);
}

/* ---------------- FULL WIZARD SUBMISSION ---------------- */
export async function createFromWizard(userId: string, fullData: any) {
  const { step1, step2, step3, step4, step5, step6, step7 } = fullData;

  // Check duplicate slug
  const existingSlug = await brandRepository.findBySlug(step1.slug);
  if (existingSlug) {
    throw new Error(`Username/slug "@${step1.slug}" is already registered on Virlio.`);
  }

  // Calculate Verification Confidence
  const combinedBrandForVerif = {
    ...step1,
    contact_email: step6.business_email,
    website: step6.website,
    social_links: step6,
    city: step1.city,
    country: step1.country,
    description: step1.short_description,
  };
  const verifResult = BrandAIService.calculateVerificationConfidence(combinedBrandForVerif, step7);

  // Normalize URLs and Social Links
  const socialLinksObj = {
    website: step6.website,
    facebook: step6.facebook,
    instagram: step6.instagram,
    tiktok: step6.tiktok,
    linkedin: step6.linkedin,
    youtube: step6.youtube,
    pinterest: step6.pinterest,
    threads: step6.threads,
    x: step6.x,
    whatsapp_business: step6.whatsapp_business,
    google_business: step6.google_business,
  };

  // Insert Brand
  const brand = await brandRepository.create({
    name: step1.name,
    slug: step1.slug,
    description: step1.short_description,
    industry: step1.industry,
    sub_industry: step1.sub_industry,
    country: step1.country,
    logo_url: step2.logo_url,
    banner_url: step2.banner_url,
    website: step6.website,
    contact_email: step6.business_email,
    social_links: socialLinksObj,
    verification_status: (verifResult.status === "needs_review" ? "pending" : verifResult.status) as any,
    verification_reason: verifResult.reasons.join("; "),
    ai_confidence_score: verifResult.confidenceScore,
    brand_score: 100,
    digital_presence_score: verifResult.confidenceScore,
    owner_id: userId,
    created_by: userId,
    settings: {
      business_type: step1.business_type,
      founded_year: step1.founded_year,
      employee_size: step1.employee_size,
      colors: {
        primary: step2.primary_color,
        secondary: step2.secondary_color,
        accent: step2.accent_color,
        darkBackground: step2.dark_bg_color,
        lightBackground: step2.light_bg_color,
      },
      typography: step2.typography,
      brand_style: step2.brand_style,
      personality: step2.brand_personality,
    },
    metadata: {
      address: { city: step1.city, state_province: step1.state_province, country: step1.country },
      tagline: step5.tagline,
    },
  });

  // Populate AI Knowledge Base
  await brandRepository.upsertKnowledgeBase(brand.id, {
    identity: {
      name: step1.name,
      slug: step1.slug,
      industry: step1.industry,
      sub_industry: step1.sub_industry,
      business_type: step1.business_type,
      colors: { primary: step2.primary_color, secondary: step2.secondary_color, accent: step2.accent_color },
      typography: step2.typography,
      personality: step2.brand_personality,
    },
    products_services: {
      products: step4.products,
      services: step4.services,
      featured_products: step4.featured_products,
      best_seller: step4.best_seller,
      price_range: step4.price_range,
      usps: step4.usps,
    },
    audience: {
      target_age_groups: step3.target_age_groups,
      target_countries: step3.target_countries,
      target_languages: step3.target_languages,
      audience_interests: step3.audience_interests,
      customer_type: step3.customer_type,
    },
    brand_voice: {
      tone: step5.brand_tone,
      communication_style: step5.communication_style,
      mission: step5.mission,
      vision: step5.vision,
      tagline: step5.tagline,
      cta_style: step5.cta_style,
    },
    restrictions: {
      words_avoid: step5.words_we_avoid,
      topics_avoid: step5.topics_to_avoid,
      humor_allowed: step5.humor_allowed,
      political_content: step5.political_content,
      religious_content: step5.religious_content,
      sensitive_topics: step5.sensitive_topics,
    },
    faqs: step4.things_customers_ask || [],
    preferred_ctas: [step5.cta_style],
    hashtags_approved: [step5.preferred_hashtag_style],
    competitors: step4.competitors || [],
    keywords: step3.audience_interests || [],
  });

  // Populate Verification record
  await brandRepository.upsertVerification(brand.id, {
    confidence_score: verifResult.confidenceScore,
    status: verifResult.status === "needs_review" ? "pending" : verifResult.status,
    reasons: verifResult.reasons,
    recommendations: verifResult.recommendations,
    evidence_data: step7,
  });

  // Log audit
  await brandRepository.createAuditLog(brand.id, userId, "BRAND_CREATED_VIA_WIZARD", { name: brand.name, slug: brand.slug });

  // Clear creation draft
  await brandRepository.deleteDraftByUser(userId);

  return brand;
}

/* ---------------- KNOWLEDGE BASE MANAGEMENT ---------------- */
export async function getKnowledgeBase(brandId: string, userId: string) {
  const role = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!role) throw new Error("Unauthorized: You do not have access to this brand");
  return brandRepository.getKnowledgeBase(brandId);
}

export async function updateKnowledgeBase(brandId: string, userId: string, data: any) {
  const role = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!role || !["owner", "admin", "manager"].includes(role)) {
    throw new Error("Unauthorized: Insufficient permissions to edit AI Knowledge Base");
  }
  await brandRepository.createAuditLog(brandId, userId, "UPDATE_AI_KNOWLEDGE_BASE", { updatedKeys: Object.keys(data) });
  return brandRepository.upsertKnowledgeBase(brandId, data);
}

/* ---------------- MEMBER & RBAC INVITATION MANAGEMENT ---------------- */
export async function getBrandMembersAndInvites(brandId: string, userId: string) {
  const role = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!role) throw new Error("Unauthorized");

  const members = await brandRepository.getMembers(brandId);
  const invitations = await brandRepository.getPendingInvitations(brandId);
  const auditLogs = ["owner", "admin"].includes(role) ? await brandRepository.getAuditLogs(brandId) : [];

  return { members, invitations, auditLogs, userRole: role };
}

export async function inviteMember(brandId: string, userId: string, input: { emailOrUsername: string; role: string }) {
  const userRole = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!userRole || !["owner", "admin", "manager"].includes(userRole)) {
    throw new Error("Unauthorized: Insufficient permissions to invite team members");
  }

  if (input.role === "owner") throw new Error("Cannot invite additional owners. Transfer ownership instead.");

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const isEmail = input.emailOrUsername.includes("@");
  const inviteData = {
    brand_id: brandId,
    email: isEmail ? input.emailOrUsername : undefined,
    username: !isEmail ? input.emailOrUsername : undefined,
    role: input.role as any,
    token,
    invited_by: userId,
    expires_at: expiresAt,
  };

  const invitation = await brandRepository.createInvitation(inviteData);
  await brandRepository.createAuditLog(brandId, userId, "INVITE_MEMBER", { invitee: input.emailOrUsername, role: input.role });

  return invitation;
}

export async function acceptInvitation(token: string, userId: string) {
  const invite = await brandRepository.getInvitationByToken(token);
  if (!invite) throw new Error("Invalid invitation token");
  if (invite.status !== "pending") throw new Error("Invitation is no longer active");
  if (new Date() > new Date(invite.expires_at)) throw new Error("Invitation token expired");

  await brandRepository.addMember(invite.brand_id, userId, invite.role, invite.invited_by);
  await brandRepository.updateInvitationStatus(invite.id, "accepted");
  await brandRepository.createAuditLog(invite.brand_id, userId, "ACCEPT_INVITATION", { role: invite.role });

  return { brand_id: invite.brand_id, role: invite.role };
}

export async function updateMemberRole(brandId: string, userId: string, memberId: string, newRole: string) {
  const currentRole = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!currentRole || !["owner", "admin"].includes(currentRole)) {
    throw new Error("Unauthorized: Only owners and admins can modify member roles");
  }

  if (newRole === "owner") throw new Error("Ownership transfer required to assign owner role.");

  const updated = await brandRepository.updateMemberRole(memberId, newRole as any);
  await brandRepository.createAuditLog(brandId, userId, "UPDATE_MEMBER_ROLE", { memberId, newRole });
  return updated;
}

export async function removeMember(brandId: string, userId: string, memberId: string) {
  const currentRole = await brandRepository.getUserRoleForBrand(brandId, userId);
  if (!currentRole || !["owner", "admin"].includes(currentRole)) {
    throw new Error("Unauthorized: Only owners and admins can remove team members");
  }

  const removed = await brandRepository.removeMember(memberId);
  await brandRepository.createAuditLog(brandId, userId, "REMOVE_MEMBER", { memberId });
  return removed;
}
