import { NextRequest } from "next/server";
import { userStatsEngine } from "@/server/services/user-stats-engine.service";
import { userRepository, brandRepository, templateRepository, memeRepository, followRepository } from "@/server/repositories";
import { apiSuccess, apiError } from "@/lib/utils/api-response";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Fetch user @ateebnoone or first user in DB
    let user = await userRepository.findByUsername("ateebnoone");
    if (!user) {
      const allUsers = await userRepository.findPublicProfiles({ limit: 1, offset: 0 });
      user = allUsers[0] ? (await userRepository.findById(allUsers[0].id)) : null;
    }

    if (!user) {
      return apiError("No user found in database for consistency audit.", 404);
    }

    // 2. Fetch Single Source of Truth Statistics
    const stats = await userStatsEngine.getUserStatistics(user.id);

    // 3. Audit Direct Database Record Counts
    const [dbBrands, dbTemplates, dbMemes, dbFollowers, dbFollowing] = await Promise.all([
      brandRepository.findByOwner(user.id),
      templateRepository.findByContributor(user.id, { limit: 500 }),
      memeRepository.findByGenerator(user.id, { limit: 500 }),
      followRepository.getFollowerCount(user.id),
      followRepository.getFollowingCount(user.id),
    ]);

    const actualVerifiedBrands = dbBrands.filter((b) => (b.verification_status || "").toLowerCase() === "verified").length;
    const actualApprovedTemplates = dbTemplates.filter((t) => t.status === "approved").length;

    // 4. Assert Consistency Across Single Source of Truth
    const auditLog: string[] = [];
    let passed = true;

    auditLog.push(`Auditing User: @${user.username || user.name} (ID: ${user.id})`);
    auditLog.push(`Trust Score: ${stats.trustScore} / 100`);
    auditLog.push(`XP: ${stats.xp}`);
    auditLog.push(`Level: Lvl ${stats.level} (Next Level: ${stats.nextLevelXp} XP)`);
    auditLog.push(`Verified Brands: ${stats.brands.verified} of ${stats.brands.owned} owned`);
    auditLog.push(`Approved Templates: ${stats.templates.approved} of ${stats.templates.total} total`);
    auditLog.push(`Memes Generated: ${stats.memes.total}`);
    auditLog.push(`Followers: ${stats.followers}`);
    auditLog.push(`Following: ${stats.following}`);

    if (stats.brands.owned !== dbBrands.length) {
      auditLog.push(`❌ DISCREPANCY: Brands Owned mismatch! Stats: ${stats.brands.owned}, DB: ${dbBrands.length}`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: Brands Owned (${stats.brands.owned}) matches database.`);
    }

    if (stats.brands.verified !== actualVerifiedBrands) {
      auditLog.push(`❌ DISCREPANCY: Verified Brands mismatch! Stats: ${stats.brands.verified}, DB: ${actualVerifiedBrands}`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: Verified Brands (${stats.brands.verified}) matches database.`);
    }

    if (stats.templates.total !== dbTemplates.length) {
      auditLog.push(`❌ DISCREPANCY: Total Templates mismatch! Stats: ${stats.templates.total}, DB: ${dbTemplates.length}`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: Total Templates (${stats.templates.total}) matches database.`);
    }

    if (stats.templates.approved !== actualApprovedTemplates) {
      auditLog.push(`❌ DISCREPANCY: Approved Templates mismatch! Stats: ${stats.templates.approved}, DB: ${actualApprovedTemplates}`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: Approved Templates (${stats.templates.approved}) matches database.`);
    }

    if (stats.memes.total !== dbMemes.length) {
      auditLog.push(`❌ DISCREPANCY: Total Memes mismatch! Stats: ${stats.memes.total}, DB: ${dbMemes.length}`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: Total Memes (${stats.memes.total}) matches database.`);
    }

    if (stats.followers !== dbFollowers) {
      auditLog.push(`❌ DISCREPANCY: Followers mismatch! Stats: ${stats.followers}, DB: ${dbFollowers}`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: Followers (${stats.followers}) matches database.`);
    }

    if (stats.following !== dbFollowing) {
      auditLog.push(`❌ DISCREPANCY: Following mismatch! Stats: ${stats.following}, DB: ${dbFollowing}`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: Following (${stats.following}) matches database.`);
    }

    // 5. Assert Achievement Eligibility
    const verifiedBrandAchievement = stats.achievements.find((a) => a.slug === "verified-brand");
    if (actualVerifiedBrands >= 1) {
      if (!verifiedBrandAchievement?.unlocked) {
        auditLog.push(`❌ DISCREPANCY: User has ${actualVerifiedBrands} verified brand(s), but Verified Brand badge is LOCKED!`);
        passed = false;
      } else {
        auditLog.push(`✅ VERIFIED BRAND BADGE: Unlocked automatically (verifiedBrands: ${actualVerifiedBrands}).`);
      }
    }

    // 6. DB User Table Match
    const dbUserFresh = await userRepository.findById(user.id);
    if (dbUserFresh?.trust_score !== stats.trustScore) {
      auditLog.push(`❌ DISCREPANCY: DB user trust_score (${dbUserFresh?.trust_score}) does not match Engine stats (${stats.trustScore})!`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: DB user trust_score (${dbUserFresh?.trust_score}) is synchronized with Engine stats (${stats.trustScore}).`);
    }

    if (dbUserFresh?.contributor_score !== stats.xp) {
      auditLog.push(`❌ DISCREPANCY: DB user contributor_score (${dbUserFresh?.contributor_score}) does not match Engine XP (${stats.xp})!`);
      passed = false;
    } else {
      auditLog.push(`✅ MATCH: DB user contributor_score (${dbUserFresh?.contributor_score}) is synchronized with Engine XP (${stats.xp}).`);
    }

    return apiSuccess({
      passed,
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
      },
      auditLog,
      stats,
    });
  } catch (error: any) {
    console.error("Test Consistency Error:", error);
    return apiError(error.message || "Failed to execute consistency test", 500);
  }
}
