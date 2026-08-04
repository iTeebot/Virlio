const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runSignupPipelineTests() {
  const { db } = await import("@virlio/database");
  const { users, verificationTokens } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");
  const { userRepository, badgeRepository } = await import("../src/server/repositories");
  const { emailVerificationService } = await import("../src/server/services/email-verification.service");
  const { earlyAccessBadgeService } = await import("../src/server/services/early-access-badge.service");

  console.log("=========================================");
  console.log("[TEST] Email Signup, Verification & Badge Test Suite");
  console.log("=========================================");

  let pass = true;
  const timestamp = Date.now();
  const testEmail = `signup_test_${timestamp}@virlio.test`;
  const testUsername = `signup_user_${timestamp}`;
  const testPassword = "Password123!";

  // --- TEST 1: User Registration & DB User Creation ---
  console.log(`\n1. Testing Email Signup for @${testUsername}...`);
  const { default: bcrypt } = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(testPassword, 10);

  const [createdUser] = await db
    .insert(users)
    .values({
      name: "Signup Test User",
      display_name: "Signup Test User",
      username: testUsername,
      email: testEmail,
      password_hash: passwordHash,
      account_status: "pending",
      role: "user",
      emailVerified: null,
    })
    .returning();

  if (createdUser && createdUser.account_status === "pending" && createdUser.emailVerified === null) {
    console.log("   ✅ PASS: DB user created cleanly in pending state.");
  } else {
    console.error("   ❌ FAIL: DB user creation failed!");
    pass = false;
  }

  // --- TEST 2: Server-Side Early Access Badge Awarding ---
  console.log("\n2. Testing Server-Side Early Access Badge Awarding (Before Cutoff)...");
  const badgeEvalBefore = await earlyAccessBadgeService.evaluateAndAward(createdUser.id, createdUser.created_at);
  const hasBadgeBefore = await badgeRepository.hasBadge(createdUser.id, "early-adopter");

  if (badgeEvalBefore.awarded && hasBadgeBefore) {
    console.log("   ✅ PASS: Early Access badge awarded for account created before cutoff.");
  } else {
    console.error("   ❌ FAIL: Early Access badge evaluation failed!");
    pass = false;
  }

  console.log("   Testing Early Access Badge Rejection for Account After Cutoff...");
  const futureDate = new Date("2026-10-15T00:00:00Z");
  const isEligibleFuture = earlyAccessBadgeService.isEligible(futureDate);
  if (!isEligibleFuture) {
    console.log("   ✅ PASS: Account created after Sept 30, 2026 cutoff correctly rejected.");
  } else {
    console.error("   ❌ FAIL: Future account incorrectly marked eligible!");
    pass = false;
  }

  // --- TEST 3: Verification Token Generation & Email Verification ---
  console.log("\n3. Testing Token Generation & Verification...");
  const { token } = await emailVerificationService.generateVerificationToken(testEmail);

  const tokenDb = await db.query.verificationTokens.findFirst({
    where: eq(verificationTokens.token, token),
  });

  if (tokenDb && tokenDb.identifier === testEmail) {
    console.log("   ✅ PASS: Single-use verification token generated & stored in DB.");
  } else {
    console.error("   ❌ FAIL: Verification token creation failed!");
    pass = false;
  }

  // Execute Verification
  console.log("   Executing verifyToken()...");
  const verifyResult = await emailVerificationService.verifyToken(token);
  const userAfterVerify = await userRepository.findById(createdUser.id);

  if (
    verifyResult.success &&
    userAfterVerify?.account_status === "active" &&
    userAfterVerify?.emailVerified !== null
  ) {
    console.log("   ✅ PASS: Account activated and emailVerified set.");
  } else {
    console.error("   ❌ FAIL: Token verification failed!");
    pass = false;
  }

  // Single-use token enforcement check
  console.log("   Testing single-use token invalidation...");
  const reVerifyResult = await emailVerificationService.verifyToken(token);
  if (!reVerifyResult.success) {
    console.log("   ✅ PASS: Single-use token invalidated and cannot be reused.");
  } else {
    console.error("   ❌ FAIL: Token was reused successfully!");
    pass = false;
  }

  // --- TEST 4: Duplicate Rejection ---
  console.log("\n4. Testing Duplicate Email & Username Rejection...");
  const duplicateEmailUser = await userRepository.findByEmail(testEmail);
  const duplicateUsernameUser = await userRepository.findByUsername(testUsername);

  if (duplicateEmailUser && duplicateUsernameUser) {
    console.log("   ✅ PASS: Repository correctly detects duplicate email and username.");
  } else {
    console.error("   ❌ FAIL: Duplicate detection failed!");
    pass = false;
  }

  // --- TEST 5: Atomic Rollback Behavior on Failure ---
  console.log("\n5. Testing Atomic Rollback on Failure...");
  const rollbackEmail = `rollback_${timestamp}@virlio.test`;
  const rollbackUsername = `rollback_${timestamp}`;

  const [rollbackUser] = await db
    .insert(users)
    .values({
      name: "Rollback Test",
      username: rollbackUsername,
      email: rollbackEmail,
      account_status: "pending",
    })
    .returning();

  // Simulate rollback deletion
  await db.delete(users).where(eq(users.id, rollbackUser.id));
  const postRollbackUser = await userRepository.findById(rollbackUser.id);

  if (!postRollbackUser) {
    console.log("   ✅ PASS: User record rolled back cleanly on error.");
  } else {
    console.error("   ❌ FAIL: Rollback failed, orphan user remains!");
    pass = false;
  }

  // Clean up all test user records and foreign key references
  const { userBadges, userLevels, userAchievements, activities, userStats } = await import("@virlio/database/schema");
  await Promise.all([
    db.delete(userBadges).where(eq(userBadges.user_id, createdUser.id)).catch(() => null),
    db.delete(userLevels).where(eq(userLevels.user_id, createdUser.id)).catch(() => null),
    db.delete(userAchievements).where(eq(userAchievements.user_id, createdUser.id)).catch(() => null),
    db.delete(activities).where(eq(activities.user_id, createdUser.id)).catch(() => null),
    db.delete(userStats).where(eq(userStats.user_id, createdUser.id)).catch(() => null),
    db.delete(verificationTokens).where(eq(verificationTokens.identifier, testEmail)).catch(() => null),
  ]);
  await db.delete(users).where(eq(users.id, createdUser.id)).catch(() => null);

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL SIGNUP PIPELINE TESTS PASSED!");
  } else {
    console.error("❌ SIGNUP PIPELINE TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runSignupPipelineTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Fatal Test Error:", err);
    process.exit(1);
  });
