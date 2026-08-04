const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import { evaluatePasswordStrength } from "../src/components/auth/PasswordStrength";

async function runWizardTests() {
  const { db } = await import("@virlio/database");
  const { users, userBadges, verificationTokens, activities, userStats } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");

  console.log("=========================================");
  console.log("[TEST] Registration Wizard & Server Validation Suite");
  console.log("=========================================");

  let pass = true;
  const timestamp = Date.now();
  const testEmail = `wizard_${timestamp}@virlio.test`;
  const testUsername = `wizard_user_${timestamp}`;
  let createdUserId: string | null = null;

  // 1. Password Strength Unit Tests
  console.log("\n1. Testing Password Strength Evaluator...");
  const weak = evaluatePasswordStrength("12345");
  const common = evaluatePasswordStrength("password123");
  const strong = evaluatePasswordStrength("Virlio2026!Secure");

  if (!weak.isValid && weak.label === "Weak") {
    console.log("   ✅ PASS: Weak password correctly rejected.");
  } else {
    console.error("   ❌ FAIL: Weak password evaluation incorrect!");
    pass = false;
  }

  if (common.isCommon) {
    console.log("   ✅ PASS: Common password pattern detected.");
  } else {
    console.error("   ❌ FAIL: Common password detection failed!");
    pass = false;
  }

  if (strong.isValid && (strong.label === "Strong" || strong.label === "Very Strong")) {
    console.log("   ✅ PASS: Strong password evaluated correctly.");
  } else {
    console.error("   ❌ FAIL: Strong password evaluation failed!");
    pass = false;
  }

  // 2. Server Rejection when Terms & Conditions are missing/false
  console.log("\n2. Testing Server Rejection when Terms & Conditions missing...");
  const { POST: registerHandler } = await import("../src/app/api/v1/auth/register/route");

  const noTermsReq = new Request("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Test Wizard User",
      username: testUsername,
      email: testEmail,
      password: "VirlioPass2026!",
      termsAccepted: false, // Bypassed client checkbox
    }),
  });

  const noTermsRes = await registerHandler(noTermsReq as any);
  const noTermsJson = await noTermsRes.json();

  if (noTermsRes.status === 400 && noTermsJson.error?.includes("Terms and Conditions")) {
    console.log("   ✅ PASS: Server rejected registration without accepted terms.");
  } else {
    console.error("   ❌ FAIL: Server accepted registration without terms!", noTermsJson);
    pass = false;
  }

  // 3. Server Rejection for Reserved Username
  console.log("\n3. Testing Server Rejection for Reserved Username...");
  const reservedReq = new Request("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Admin Impersonator",
      username: "admin",
      email: `admin_${timestamp}@virlio.test`,
      password: "VirlioPass2026!",
      termsAccepted: true,
    }),
  });

  const reservedRes = await registerHandler(reservedReq as any);
  const reservedJson = await reservedRes.json();

  if (reservedRes.status === 400 && reservedJson.error?.includes("reserved")) {
    console.log("   ✅ PASS: Server rejected reserved username ('admin').");
  } else {
    console.error("   ❌ FAIL: Server accepted reserved username!", reservedJson);
    pass = false;
  }

  // 4. Full Successful Registration with Terms & Password Strength
  console.log("\n4. Testing Full Two-Step Registration with Accepted Terms...");
  const validReq = new Request("http://localhost:3000/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      fullName: "Wizard Test Creator",
      username: testUsername,
      email: testEmail,
      password: "VirlioPass2026!",
      termsAccepted: true,
      marketingOptIn: true,
    }),
  });

  const validRes = await registerHandler(validReq as any);
  const validJson = await validRes.json();

  if ((validRes.status === 200 || validRes.status === 201) && validJson.success && validJson.data?.registered) {
    console.log(`   ✅ PASS: Registration completed cleanly for @${testUsername}.`);
    
    // Verify database record has marketing_opt_in = true and marketing_opt_in_at set
    const [dbCreated] = await db.select().from(users).where(eq(users.email, testEmail));
    if (dbCreated && dbCreated.marketing_opt_in === true && dbCreated.marketing_opt_in_at !== null) {
      createdUserId = dbCreated.id;
      console.log("   ✅ PASS: Database correctly stored marketing_opt_in=true and compliance audit timestamp.");
    } else {
      console.error("   ❌ FAIL: marketing_opt_in column was not properly saved in database!", dbCreated);
      pass = false;
    }
  } else {
    console.error("   ❌ FAIL: Registration failed!", validJson);
    pass = false;
  }

  // 5. Cleanup Test Records
  if (createdUserId) {
    console.log("\n5. Cleaning up test records from database...");
    await Promise.all([
      db.delete(userBadges).where(eq(userBadges.user_id, createdUserId)).catch(() => null),
      db.delete(activities).where(eq(activities.user_id, createdUserId)).catch(() => null),
      db.delete(userStats).where(eq(userStats.user_id, createdUserId)).catch(() => null),
      db.delete(verificationTokens).where(eq(verificationTokens.identifier, testEmail)).catch(() => null),
    ]);
    await db.delete(users).where(eq(users.id, createdUserId)).catch(() => null);
    console.log("   ✅ PASS: Test data purged from database.");
  }

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL REGISTRATION WIZARD TESTS PASSED!");
  } else {
    console.error("❌ REGISTRATION WIZARD TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runWizardTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Registration Wizard test run failed:", err);
    process.exit(1);
  });
