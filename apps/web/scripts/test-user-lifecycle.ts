const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runLifecycleTest() {
  const { db } = await import("@virlio/database");
  const { users, brands, templates } = await import("@virlio/database/schema");
  const { eq, isNull } = await import("drizzle-orm");
  const { userRepository, brandRepository, templateRepository } = await import("../src/server/repositories");
  const { userLifecycleService } = await import("../src/server/services/user-lifecycle.service");

  console.log("=========================================");
  console.log("[TEST] User Lifecycle & Account Deletion Test Suite");
  console.log("=========================================");

  let pass = true;

  // 1. Create a dummy test user
  const testEmail = `test_lifecycle_${Date.now()}@virlio.test`;
  const testUsername = `test_user_${Date.now()}`;

  console.log(`\n1. Creating test user: @${testUsername} (${testEmail})`);
  const createdUser = await userRepository.create({
    name: "Lifecycle Test User",
    username: testUsername,
    email: testEmail,
    role: "user",
    account_status: "active",
  });

  const userId = createdUser.id;
  console.log(`   ✓ Created User ID: ${userId}`);

  // 2. Create a test brand for the user
  console.log("\n2. Creating test brand for user...");
  const createdBrand = await brandRepository.create({
    owner_id: userId,
    name: "Lifecycle Test Brand",
    slug: `test-brand-${Date.now()}`,
    description: "Test brand workspace for deletion test",
  } as any);
  console.log(`   ✓ Created Brand ID: ${createdBrand.id}`);

  // 3. Create a public approved template for the user
  console.log("\n3. Creating approved public template for user...");
  const createdTemplate = await templateRepository.create({
    title: "Lifecycle Test Template",
    slug: `lifecycle-test-template-${Date.now()}`,
    uploaded_by: userId,
    moderation_status: "approved",
    status: "approved",
  } as any);
  console.log(`   ✓ Created Template ID: ${createdTemplate.id}`);

  // 4. Perform Soft Account Deletion via UserLifecycleService
  console.log("\n4. Triggering userLifecycleService.deleteUserAccount()...");
  const deletionResult = await userLifecycleService.deleteUserAccount(userId, "Integration Test Deletion");
  console.log(`   ✓ Deletion Result:`, deletionResult);

  // Assert 1: User soft-deleted in database
  const deletedUserDb = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  console.log("\n--- Assert 1: User Record Soft Deletion & Anonymization ---");
  console.log(`   User account_status: ${deletedUserDb?.account_status}`);
  console.log(`   User deleted_at: ${deletedUserDb?.deleted_at}`);
  console.log(`   User name: ${deletedUserDb?.name}`);
  console.log(`   User email: ${deletedUserDb?.email}`);

  if (
    deletedUserDb?.account_status === "deleted" &&
    deletedUserDb?.deleted_at !== null &&
    deletedUserDb?.name === "Deleted User" &&
    deletedUserDb?.email === null
  ) {
    console.log("   ✅ PASS: User record is soft-deleted and email is freed up for re-registration.");
  } else {
    console.error("   ❌ FAIL: User record soft deletion assertion failed!");
    pass = false;
  }

  // Assert 2: UserRepository queries exclude deleted user
  console.log("\n--- Assert 2: UserRepository Excludes Soft-Deleted User ---");
  const findByIdRes = await userRepository.findById(userId);
  const findByUsernameRes = await userRepository.findByUsername(testUsername);
  const findByEmailRes = await userRepository.findByEmail(testEmail);

  if (!findByIdRes && !findByUsernameRes && !findByEmailRes) {
    console.log("   ✅ PASS: Deleted user is excluded from findById, findByUsername, and findByEmail.");
  } else {
    console.error("   ❌ FAIL: Deleted user still returned by repository queries!");
    pass = false;
  }

  // Assert 3: Brand is archived
  console.log("\n--- Assert 3: Owned Brand Archiving ---");
  const archivedBrandDb = await db.query.brands.findFirst({
    where: eq(brands.id, createdBrand.id),
  });

  if (archivedBrandDb?.is_archived === true || archivedBrandDb?.deleted_at !== null) {
    console.log("   ✅ PASS: Owned brand was archived and removed from active workspace listings.");
  } else {
    console.error("   ❌ FAIL: Owned brand was not archived!");
    pass = false;
  }

  // Assert 4: Public template retained and anonymized
  console.log("\n--- Assert 4: Approved Template Retained & Anonymized ---");
  const retainedTemplateDb = await db.query.templates.findFirst({
    where: eq(templates.id, createdTemplate.id),
  });

  if (retainedTemplateDb && retainedTemplateDb.uploaded_by === null) {
    console.log("   ✅ PASS: Approved public template retained with anonymized uploader attribution.");
  } else {
    console.error("   ❌ FAIL: Approved template missing or attribution not anonymized!");
    pass = false;
  }

  // Cleanup test artifacts
  await db.delete(templates).where(eq(templates.id, createdTemplate.id)).catch(() => null);
  await db.delete(brands).where(eq(brands.id, createdBrand.id)).catch(() => null);
  await db.delete(users).where(eq(users.id, userId)).catch(() => null);

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL USER LIFECYCLE & DELETION TESTS PASSED!");
  } else {
    console.error("❌ USER LIFECYCLE TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runLifecycleTest()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Fatal Lifecycle Test Error:", err);
    process.exit(1);
  });
