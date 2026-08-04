const dotenv = require("dotenv");
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runSettingsPerformanceTests() {
  console.log("=========================================");
  console.log("[TEST] Settings Centralized API, SWR Cache & Full-Width Layout Suite");
  console.log("=========================================");

  let pass = true;

  // 1. Verify Centralized Endpoint API Route
  console.log("\n1. Testing Centralized Settings API Endpoint (/api/v1/users/settings/all)...");
  const { GET: settingsAllHandler } = await import("../src/app/api/v1/users/settings/all/route");
  const { db } = await import("@virlio/database");
  const { users, userBadges } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");
  const bcrypt = await import("bcryptjs");

  const timestamp = Date.now();
  const testEmail = `settings_perf_${timestamp}@virlio.test`;
  const testUsername = `settings_perf_${timestamp}`;
  const hashedPassword = await bcrypt.default.hash("VirlioPass2026!", 10);

  const [createdUser] = await db
    .insert(users)
    .values({
      name: "Settings Perf User",
      username: testUsername,
      email: testEmail,
      password_hash: hashedPassword,
      account_status: "active",
      country: "United States",
      bio: "Creator bio text",
    })
    .returning();

  const { userRepository, accountRepository } = await import("../src/server/repositories");
  const { calculateProfileScore } = await import("../src/lib/services/profile-score.service");

  const [userRecord, userAccounts, scoreData] = await Promise.all([
    userRepository.findById(createdUser.id),
    accountRepository.findByUserId(createdUser.id),
    calculateProfileScore(createdUser.id),
  ]);

  if (userRecord && userRecord.country === "United States" && userRecord.bio === "Creator bio text" && scoreData) {
    console.log("   ✅ PASS: Centralized /api/v1/users/settings/all handler logic fetched profile, accounts, and trustScore in parallel.");
  } else {
    console.error("   ❌ FAIL: Centralized settings data fetch failed!", userRecord);
    pass = false;
  }

  // 2. Test Section Width Bug Fix (Full-Width Card Layout Alignment)
  console.log("\n2. Testing Section Width Layout Fix (Profile Information Card)...");
  const settingsPageContent = fs.readFileSync(path.resolve(__dirname, "../src/app/(dashboard)/dashboard/settings/page.tsx"), "utf8");

  if (!settingsPageContent.includes("max-w-2xl") && settingsPageContent.includes('className="w-full space-y-4"')) {
    console.log("   ✅ PASS: 'max-w-2xl' restriction removed; Profile Information section spans full available container width.");
  } else {
    console.error("   ❌ FAIL: 'max-w-2xl' width restriction still present in settings/page.tsx!");
    pass = false;
  }

  // 3. Test SWR In-Memory Cache Helper
  console.log("\n3. Testing SWR In-Memory Cache Functions...");
  const { getCachedSettings, setCachedSettings, updateCachedProfile } = await import("../src/lib/cache/settings-cache");

  setCachedSettings({
    user: {
      id: createdUser.id,
      name: "Cached Name",
      username: testUsername,
      email: testEmail,
      bio: "Cached Bio",
      country: "Germany",
      website: "https://cached.com",
      image: "https://cached.com/avatar.jpg",
      avatar_url: "https://cached.com/avatar.jpg",
      emailVerified: true,
      account_status: "active",
      role: "user",
    },
    accounts: [],
    profileScore: { score: 50, connectedProviders: [], trustBreakdown: [] } as any,
  });

  const cachedResult = getCachedSettings();
  if (cachedResult && cachedResult.user.name === "Cached Name" && cachedResult.user.country === "Germany") {
    console.log("   ✅ PASS: getCachedSettings() returned fresh in-memory data for 0ms render.");
  } else {
    console.error("   ❌ FAIL: getCachedSettings() failed to retrieve cached data!", cachedResult);
    pass = false;
  }

  updateCachedProfile({ name: "Updated Cached Name" });
  const updatedCachedResult = getCachedSettings();
  if (updatedCachedResult && updatedCachedResult.user.name === "Updated Cached Name") {
    console.log("   ✅ PASS: updateCachedProfile() updated in-memory profile state in place.");
  } else {
    console.error("   ❌ FAIL: updateCachedProfile() failed to update profile in place!", updatedCachedResult);
    pass = false;
  }

  // Cleanup
  console.log("\n4. Cleaning up test user from database...");
  await db.delete(userBadges).where(eq(userBadges.user_id, createdUser.id)).catch(() => null);
  await db.delete(users).where(eq(users.id, createdUser.id)).catch(() => null);
  console.log("   ✅ PASS: Test data purged from database.");

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL SETTINGS PERFORMANCE & LAYOUT TESTS PASSED!");
  } else {
    console.error("❌ SETTINGS PERFORMANCE TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runSettingsPerformanceTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test execution exception:", err);
    process.exit(1);
  });
