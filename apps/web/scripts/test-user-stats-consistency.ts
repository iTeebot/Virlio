/**
 * Programmatic Consistency Test Suite for User Statistics Single Source of Truth
 * Run with: npx tsx scripts/test-user-stats-consistency.ts
 */
import { userStatsEngine } from "../src/server/services/user-stats-engine.service";
import { userRepository, brandRepository, templateRepository, memeRepository, followRepository } from "../src/server/repositories";

async function runConsistencyTest() {
  console.log("=========================================");
  console.log("[TEST SUITE] User Statistics Single Source of Truth Audit");
  console.log("=========================================");

  // 1. Fetch user @ateebnoone or first user in DB
  let user = await userRepository.findByUsername("ateebnoone");
  if (!user) {
    console.log("[TEST] User @ateebnoone not found by handle, searching all users...");
    const allUsers = await userRepository.findPublicProfiles({ limit: 1, offset: 0 });
    user = allUsers[0] ? (await userRepository.findById(allUsers[0].id)) : null;
  }

  if (!user) {
    console.error("❌ TEST FAILED: No user found in database for consistency audit.");
    process.exit(1);
  }

  console.log(`[TEST] Auditing user: @${user.username || user.name} (ID: ${user.id})`);

  // 2. Fetch Single Source of Truth Statistics
  const stats = await userStatsEngine.getUserStatistics(user.id);

  console.log("-----------------------------------------");
  console.log(`[METRICS] Trust Score       : ${stats.trustScore} / 100`);
  console.log(`[METRICS] Total XP          : ${stats.xp}`);
  console.log(`[METRICS] Level             : ${stats.level} (Next Level XP: ${stats.nextLevelXp})`);
  console.log(`[METRICS] Verified Brands   : ${stats.brands.verified} of ${stats.brands.owned} owned`);
  console.log(`[METRICS] Templates Approved: ${stats.templates.approved} of ${stats.templates.total} total`);
  console.log(`[METRICS] Memes Generated   : ${stats.memes.total}`);
  console.log(`[METRICS] Followers         : ${stats.followers}`);
  console.log(`[METRICS] Following         : ${stats.following}`);
  console.log("-----------------------------------------");

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
  let passed = true;

  if (stats.brands.owned !== dbBrands.length) {
    console.error(`❌ DISCREPANCY: Brands Owned mismatch! Stats: ${stats.brands.owned}, DB: ${dbBrands.length}`);
    passed = false;
  }

  if (stats.brands.verified !== actualVerifiedBrands) {
    console.error(`❌ DISCREPANCY: Verified Brands mismatch! Stats: ${stats.brands.verified}, DB: ${actualVerifiedBrands}`);
    passed = false;
  }

  if (stats.templates.total !== dbTemplates.length) {
    console.error(`❌ DISCREPANCY: Total Templates mismatch! Stats: ${stats.templates.total}, DB: ${dbTemplates.length}`);
    passed = false;
  }

  if (stats.templates.approved !== actualApprovedTemplates) {
    console.error(`❌ DISCREPANCY: Approved Templates mismatch! Stats: ${stats.templates.approved}, DB: ${actualApprovedTemplates}`);
    passed = false;
  }

  if (stats.memes.total !== dbMemes.length) {
    console.error(`❌ DISCREPANCY: Total Memes mismatch! Stats: ${stats.memes.total}, DB: ${dbMemes.length}`);
    passed = false;
  }

  if (stats.followers !== dbFollowers) {
    console.error(`❌ DISCREPANCY: Followers mismatch! Stats: ${stats.followers}, DB: ${dbFollowers}`);
    passed = false;
  }

  if (stats.following !== dbFollowing) {
    console.error(`❌ DISCREPANCY: Following mismatch! Stats: ${stats.following}, DB: ${dbFollowing}`);
    passed = false;
  }

  // 5. Assert Achievement Eligibility: Verified Brand Badge MUST be unlocked if verifiedBrands >= 1
  const verifiedBrandAchievement = stats.achievements.find((a) => a.slug === "verified-brand");
  if (actualVerifiedBrands >= 1) {
    if (!verifiedBrandAchievement?.unlocked) {
      console.error(`❌ DISCREPANCY: User has ${actualVerifiedBrands} verified brand(s), but Verified Brand badge is LOCKED!`);
      passed = false;
    } else {
      console.log("✅ VERIFIED BRAND BADGE: Unlocked automatically as expected.");
    }
  }

  // 6. Assert DB user table is synchronized with stats
  const dbUserFresh = await userRepository.findById(user.id);
  if (dbUserFresh?.trust_score !== stats.trustScore) {
    console.error(`❌ DISCREPANCY: DB user trust_score (${dbUserFresh?.trust_score}) does not match Engine stats (${stats.trustScore})!`);
    passed = false;
  }

  if (dbUserFresh?.contributor_score !== stats.xp) {
    console.error(`❌ DISCREPANCY: DB user contributor_score (${dbUserFresh?.contributor_score}) does not match Engine XP (${stats.xp})!`);
    passed = false;
  }

  console.log("-----------------------------------------");
  if (passed) {
    console.log("✅ SUCCESS: All User Statistics, XP, Trust Scores, and Achievements are 100% IN SYNC across all platform providers!");
    process.exit(0);
  } else {
    console.error("❌ FAILED: User statistics discrepancies detected.");
    process.exit(1);
  }
}

runConsistencyTest().catch((err) => {
  console.error("❌ Fatal Error running consistency test:", err);
  process.exit(1);
});
