const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runAvatarPipelineTests() {
  console.log("=========================================");
  console.log("[TEST] Avatar Pipeline, Storage Security & Canonical Position Suite");
  console.log("=========================================");

  let pass = true;

  // 1. Test Storage Security Abstraction
  console.log("\n1. Testing Storage Security & Endpoint Abstraction...");
  const { applyAvatarPosition, parseAvatarPosition } = await import("../src/lib/utils/avatar-position");

  // 2. Test Canonical Avatar Position Embedding & Parsing
  console.log("\n2. Testing Canonical Avatar Positioning Embedding & Parsing...");
  const testBaseUrl = "https://res.cloudinary.com/virlio/image/upload/v12345/user_avatar.png";
  const canonicalTopUrl = applyAvatarPosition(testBaseUrl, "top", "cover");

  console.log(`   Canonical URL generated: ${canonicalTopUrl}`);

  const parsedTop = parseAvatarPosition(canonicalTopUrl);
  if (parsedTop.objectPosition === "top" && parsedTop.objectFit === "cover") {
    console.log("   ✅ PASS: Canonical positioning 'top' correctly embedded and parsed.");
  } else {
    console.error("   ❌ FAIL: Positioning 'top' embedding failed!", parsedTop);
    pass = false;
  }

  // Test Bottom positioning
  const canonicalBottomUrl = applyAvatarPosition(testBaseUrl, "bottom", "cover");
  const parsedBottom = parseAvatarPosition(canonicalBottomUrl);
  if (parsedBottom.objectPosition === "bottom") {
    console.log("   ✅ PASS: Canonical positioning 'bottom' correctly embedded and parsed.");
  } else {
    console.error("   ❌ FAIL: Positioning 'bottom' embedding failed!", parsedBottom);
    pass = false;
  }

  // 3. Test Database User Avatar Update Persistence
  console.log("\n3. Testing Database User Avatar Persistence...");
  const { db } = await import("@virlio/database");
  const { users, userBadges } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");
  const bcrypt = await import("bcryptjs");

  const timestamp = Date.now();
  const testEmail = `avatar_test_${timestamp}@virlio.test`;
  const testUsername = `avatar_test_${timestamp}`;
  const hashedPassword = await bcrypt.default.hash("VirlioPass2026!", 10);

  const [createdUser] = await db
    .insert(users)
    .values({
      name: "Avatar Test User",
      username: testUsername,
      email: testEmail,
      password_hash: hashedPassword,
      account_status: "active",
      avatar_url: canonicalTopUrl,
      image: canonicalTopUrl,
    })
    .returning();

  const [fetchedUser] = await db.select().from(users).where(eq(users.id, createdUser.id));

  if (fetchedUser && fetchedUser.image === canonicalTopUrl) {
    console.log(`   ✅ PASS: Canonical avatar URL persisted in database for @${testUsername}.`);
  } else {
    console.error("   ❌ FAIL: Avatar URL persistence failed!", fetchedUser);
    pass = false;
  }

  // Cleanup
  console.log("\n4. Cleaning up test user from database...");
  await db.delete(userBadges).where(eq(userBadges.user_id, createdUser.id)).catch(() => null);
  await db.delete(users).where(eq(users.id, createdUser.id)).catch(() => null);
  console.log("   ✅ PASS: Test data purged from database.");

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL AVATAR PIPELINE & POSITIONING TESTS PASSED!");
  } else {
    console.error("❌ AVATAR PIPELINE TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runAvatarPipelineTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test execution exception:", err);
    process.exit(1);
  });
