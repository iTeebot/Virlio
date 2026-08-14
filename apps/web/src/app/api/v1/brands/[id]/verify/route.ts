import { NextRequest, NextResponse } from "next/server";
import { brandService, authService } from "@/server/services";
import { brandRepository } from "@/server/repositories";
import { calculateBrandTrustScore } from "@/lib/services/brand-trust-score.service";
import { apiSuccess, apiError, apiUnauthorized, apiNotFound } from "@/lib/utils/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await authService.getCurrentSession();
    if (!session?.user?.id) return apiUnauthorized();

    const role = await brandRepository.getUserRoleForBrand(id, session.user.id);
    if (!role || !["owner", "admin", "manager"].includes(role)) {
      return apiUnauthorized("Insufficient permissions");
    }

    const brand = await brandRepository.findById(id);
    if (!brand) return apiNotFound("Brand not found");

    const body = await req.json().catch(() => ({}));
    const forceAdminApprove = body.forceAdminApprove === true;

    const existingVerif = await brandRepository.getVerification(brand.id);
    const existingEvidence = (existingVerif?.evidence_data as Record<string, any>) || {};
    const newEvidence = body.evidenceData || {};

    const evidenceData = {
      ...existingEvidence,
      ...newEvidence,
      dns_txt_record: newEvidence.dns_txt_record || existingEvidence.dns_txt_record || "",
      meta_tag: newEvidence.meta_tag || existingEvidence.meta_tag || "",
      email_verified: newEvidence.email_verified ?? existingEvidence.email_verified ?? true,
    };

    const combinedBrand = {
      ...brand,
      contact_email: brand.contact_email,
      website: brand.website,
      social_links: brand.social_links || {},
      email_verified: evidenceData.email_verified || true,
      verification: { evidence_data: evidenceData },
    };

    const scoreResult = calculateBrandTrustScore(combinedBrand, evidenceData);
    const dbStatus = forceAdminApprove || scoreResult.isVerified ? "verified" : "pending";
    const confidenceScore = forceAdminApprove ? 100 : scoreResult.trustScore;

    await brandRepository.upsertVerification(brand.id, {
      confidence_score: confidenceScore,
      status: dbStatus,
      reasons: ["Transparent 100-point trust score evaluation completed."],
      recommendations: scoreResult.improvementSuggestions.map((s) => s.item.name),
      evidence_data: evidenceData,
    });

    await brandRepository.update(brand.id, {
      verification_status: dbStatus as any,
      verification_reason: `Trust score: ${confidenceScore} / 100 PTS. Status: ${dbStatus.toUpperCase()}`,
      ai_confidence_score: confidenceScore,
      brand_score: confidenceScore,
      digital_presence_score: confidenceScore,
    });

    const { invalidateCacheTag } = await import("@/server/services/cache-server.service");
    if (brand.slug) invalidateCacheTag(`brand:${brand.slug}`);
    invalidateCacheTag(`brand:${brand.id}`);

    await brandRepository.createAuditLog(brand.id, session.user.id, "RUN_VERIFICATION_CHECK", {
      score: confidenceScore,
      status: dbStatus,
      forced: forceAdminApprove,
    });

    // Automatically recalculate statistics & award Verified Brand badge when verified
    if (dbStatus === "verified") {
      const { badgeRepository } = await import("@/server/repositories");
      await badgeRepository.awardBadgeBySlug(session.user.id, "verified-brand").catch(() => null);
      if (brand.owner_id && brand.owner_id !== session.user.id) {
        await badgeRepository.awardBadgeBySlug(brand.owner_id, "verified-brand").catch(() => null);
      }
    }

    const { userStatsEngine } = await import("@/server/services/user-stats-engine.service");
    await userStatsEngine.getUserStatistics(session.user.id).catch(() => null);

    const { activityEngine } = await import("@/server/services/activity-engine.service");
    await activityEngine.recordActivity(session.user.id, "brand_verified", "brand", brand.id, { status: dbStatus }).catch(() => null);

    return apiSuccess({
      confidenceScore,
      status: dbStatus,
      verificationStatus: dbStatus,
      trustScore: confidenceScore,
      checklist: scoreResult.checklist,
      improvementSuggestions: scoreResult.improvementSuggestions,
    });
  } catch (error: any) {
    console.error("Brand Verification Error:", error);
    return apiError(error.message || "Failed to verify brand", 500);
  }
}
