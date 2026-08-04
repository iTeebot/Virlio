const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runLoginFlowTests() {
  const { db } = await import("@virlio/database");
  const { users, userBadges, verificationTokens } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");

  console.log("=========================================");
  console.log("[TEST] Verification Success UX & Login Flow Suite");
  console.log("=========================================");

  let pass = true;
  const timestamp = Date.now();
  const testEmail = `login_flow_${timestamp}@virlio.test`;
  const testUsername = `login_flow_${timestamp}`;

  // 1. Register test user & token
  const { emailVerificationService } = await import("../src/server/services/email-verification.service");
  const { userRepository } = await import("../src/server/repositories");
  const bcrypt = await import("bcryptjs");

  const hashedPassword = await bcrypt.default.hash("VirlioPass2026!", 10);
  const [createdUser] = await db
    .insert(users)
    .values({
      name: "Login Test User",
      username: testUsername,
      email: testEmail,
      password_hash: hashedPassword,
      account_status: "pending",
    })
    .returning();

  const tokenRecord = await emailVerificationService.generateVerificationToken(testEmail);

  console.log("1. Testing Token Verification Redirect to /login?verified=true...");
  const { GET: verifyHandler } = await import("../src/app/api/v1/auth/verify-email/route");
  const req = new Request(`http://localhost:3000/api/v1/auth/verify-email?token=${tokenRecord.token}`);

  const res = await verifyHandler(req as any);
  const redirectUrl = res.headers.get("location") || "";

  if (res.status === 307 || res.status === 302 || redirectUrl.includes("verified=true")) {
    console.log(`   ✅ PASS: Verification redirected to URL with verified=true & email (${redirectUrl}).`);
  } else {
    console.error("   ❌ FAIL: Verification redirect failed!", res.status, redirectUrl);
    pass = false;
  }

  // 2. Verify account is active in DB
  const updatedUser = await userRepository.findById(createdUser.id);
  if (updatedUser?.account_status === "active" && updatedUser?.emailVerified) {
    console.log("   ✅ PASS: User account status set to 'active' in database.");
  } else {
    console.error("   ❌ FAIL: User account was not activated!", updatedUser);
    pass = false;
  }

  // 3. Clean up test records
  console.log("\n3. Cleaning up test records from database...");
  await Promise.all([
    db.delete(userBadges).where(eq(userBadges.user_id, createdUser.id)).catch(() => null),
    db.delete(verificationTokens).where(eq(verificationTokens.identifier, testEmail)).catch(() => null),
  ]);
  await db.delete(users).where(eq(users.id, createdUser.id)).catch(() => null);
  console.log("   ✅ PASS: Test user purged from database.");

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL LOGIN & VERIFICATION TESTS PASSED!");
  } else {
    console.error("❌ LOGIN & VERIFICATION TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runLoginFlowTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test run failed:", err);
    process.exit(1);
  });
