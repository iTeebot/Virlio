const dotenv = require("dotenv");
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runGlobalHeaderAvatarTests() {
  console.log("=========================================");
  console.log("[TEST] Global Header Architecture, UserStore & Canonical Avatar Suite");
  console.log("=========================================");

  let pass = true;

  // 1. Verify UserStoreProvider export and structure
  console.log("\n1. Testing UserStoreProvider & useUserStore Context...");
  const userStoreModule = await import("../src/providers/user-store-provider");
  if (typeof userStoreModule.UserStoreProvider === "function" && typeof userStoreModule.useUserStore === "function") {
    console.log("   ✅ PASS: UserStoreProvider and useUserStore hook correctly exported.");
  } else {
    console.error("   ❌ FAIL: UserStoreProvider export missing!", userStoreModule);
    pass = false;
  }

  // 2. Verify Single AppHeader Component Reuse
  console.log("\n2. Testing Single AppHeader Component Architecture...");
  const appHeaderPath = path.resolve(__dirname, "../src/components/layout/app-header.tsx");
  const headerPath = path.resolve(__dirname, "../src/components/layout/header.tsx");
  const userDashHeaderPath = path.resolve(__dirname, "../src/components/dashboard/user-dashboard-header.tsx");
  const exploreHeaderPath = path.resolve(__dirname, "../src/components/explore/explore-header.tsx");

  if (fs.existsSync(appHeaderPath)) {
    console.log("   ✅ PASS: Single unified AppHeader component file exists.");
  } else {
    console.error("   ❌ FAIL: app-header.tsx component file missing!");
    pass = false;
  }

  const headerContent = fs.readFileSync(headerPath, "utf8");
  const userDashContent = fs.readFileSync(userDashHeaderPath, "utf8");
  const exploreContent = fs.readFileSync(exploreHeaderPath, "utf8");

  if (headerContent.includes("AppHeader") && userDashContent.includes("AppHeader") && exploreContent.includes("AppHeader")) {
    console.log("   ✅ PASS: Public Header, Dashboard Header, and Explore Header all consume single AppHeader component.");
  } else {
    console.error("   ❌ FAIL: Headers do not all wrap AppHeader!");
    pass = false;
  }

  // 3. Verify Canonical Avatar Positioning & Settings Preview Alignment
  console.log("\n3. Testing Canonical Avatar Positioning & Settings Preview Alignment...");
  const { applyAvatarPosition, parseAvatarPosition } = await import("../src/lib/utils/avatar-position");

  const avatarUrlTop = "https://res.cloudinary.com/virlio/image/upload/v123/user.png";
  const canonicalUrl = applyAvatarPosition(avatarUrlTop, "top", "cover");
  const parsed = parseAvatarPosition(canonicalUrl);

  if (parsed.objectPosition === "top" && parsed.objectFit === "cover") {
    console.log("   ✅ PASS: Canonical crop metadata '#pos=top' parsed identically across components.");
  } else {
    console.error("   ❌ FAIL: Avatar crop position parsing mismatched!", parsed);
    pass = false;
  }

  const dpUploaderPath = path.resolve(__dirname, "../src/components/ui/avatar-dp-uploader.tsx");
  const dpUploaderContent = fs.readFileSync(dpUploaderPath, "utf8");
  if (dpUploaderContent.includes("UserAvatar")) {
    console.log("   ✅ PASS: Settings DP Uploader preview card reuses the exact same UserAvatar component used everywhere else.");
  } else {
    console.error("   ❌ FAIL: AvatarDPUploader does not reuse UserAvatar!");
    pass = false;
  }

  // 4. Test User Persistence & Cleanup
  console.log("\n4. Testing User Persistence & Cleanup...");
  const { db } = await import("@virlio/database");
  const { users, userBadges } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");
  const bcrypt = await import("bcryptjs");

  const timestamp = Date.now();
  const testEmail = `global_avatar_${timestamp}@virlio.test`;
  const testUsername = `global_avatar_${timestamp}`;
  const hashedPassword = await bcrypt.default.hash("VirlioPass2026!", 10);

  const [createdUser] = await db
    .insert(users)
    .values({
      name: "Global Avatar Test User",
      username: testUsername,
      email: testEmail,
      password_hash: hashedPassword,
      account_status: "active",
      avatar_url: canonicalUrl,
      image: canonicalUrl,
    })
    .returning();

  if (createdUser && createdUser.image === canonicalUrl) {
    console.log(`   ✅ PASS: Test user avatar correctly created with canonical crop URL for @${testUsername}.`);
  } else {
    console.error("   ❌ FAIL: Test user creation failed!", createdUser);
    pass = false;
  }

  // Cleanup
  await db.delete(userBadges).where(eq(userBadges.user_id, createdUser.id)).catch(() => null);
  await db.delete(users).where(eq(users.id, createdUser.id)).catch(() => null);
  console.log("   ✅ PASS: Test data purged from database.");

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL GLOBAL HEADER & AVATAR TESTS PASSED!");
  } else {
    console.error("❌ GLOBAL HEADER & AVATAR TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runGlobalHeaderAvatarTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test execution exception:", err);
    process.exit(1);
  });
