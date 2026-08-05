const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(process.cwd(), "apps/web/.env") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function runMemeEngineTests() {
  console.log("=========================================");
  console.log("[TEST] AI Meme Generation Engine & Renderer Suite");
  console.log("=========================================");

  let pass = true;

  const { db } = await import("@virlio/database");
  const { users, brands, brandKnowledgeBases, templates, memes, memeGenerations } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");

  // 1. Setup Test User and Brand
  console.log("\n1. Setting up test database records...");
  
  const timestamp = Date.now();
  const testEmail = `meme_test_${timestamp}@virlio.test`;
  const testUsername = `meme_test_${timestamp}`;

  const [testUser] = await db
    .insert(users)
    .values({
      name: "Meme Engine Tester",
      username: testUsername,
      email: testEmail,
      account_status: "active",
    })
    .returning();

  const [testBrand] = await db
    .insert(brands)
    .values({
      name: "Acme Corp",
      slug: `acme-${timestamp}`,
      description: "Acme makes the best anvil products in the world.",
      industry: "Software",
      country: "US",
      language: "en",
      owner_id: testUser.id,
      verification_status: "verified",
    })
    .returning();

  await db
    .insert(brandKnowledgeBases)
    .values({
      brand_id: testBrand.id,
      identity: { tagline: "Better anvils, faster delivery" },
      brand_voice: { description: "Witty and energetic startup tone" },
      audience: { description: "Digital marketers and product leaders" },
    });

  // 2. Setup Test Meme Templates
  const [template1] = await db
    .insert(templates)
    .values({
      title: "Distracted Boyfriend",
      slug: `distracted-bf-${timestamp}`,
      description: "Boyfriend looking at another girl while girlfriend is angry",
      category: "Software",
      tags: ["procrastination", "distraction"],
      moderation_status: "approved",
      visibility: "public",
      cloudinary_secure_url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      text_layout: "top_bottom",
      ai_generation_profile: {
        humorType: "Relatable",
        textLayout: "top_bottom",
        memeStyle: "Classic Reaction",
        emotion: "Distracted",
        bestFor: ["procrastination", "software"],
      },
    })
    .returning();

  const [template2] = await db
    .insert(templates)
    .values({
      title: "Drake Hotline Bling",
      slug: `drake-${timestamp}`,
      description: "Drake turning away with disgust and drake smiling with approval",
      category: "Marketing",
      tags: ["preference", "choice"],
      moderation_status: "approved",
      visibility: "public",
      cloudinary_secure_url: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      text_layout: "top_bottom",
      ai_generation_profile: {
        humorType: "Preference",
        textLayout: "top_bottom",
        memeStyle: "Comparison",
        emotion: "Approve/Disapprove",
        bestFor: ["marketing", "choice"],
      },
    })
    .returning();

  console.log("   ✅ Brand and templates configured.");

  // 3. Test Brand Context Builder
  console.log("\n2. Testing Brand Context Builder...");
  const { buildBrandContext } = await import("../src/server/services/meme-engine/brand-context-builder");
  const brandContext = await buildBrandContext(testBrand.id);

  if (brandContext.name === "Acme Corp" && brandContext.industry === "Software") {
    console.log("   ✅ PASS: Brand Context built and verified.");
  } else {
    console.error("   ❌ FAIL: Brand Context mapping mismatch!", brandContext);
    pass = false;
  }

  // 4. Test Template Ranking Engine
  console.log("\n3. Testing Template Ranking Engine...");
  const { rankTemplates } = await import("../src/server/services/meme-engine/template-ranking-engine");
  const ranked = await rankTemplates(brandContext, "I need a meme about software engineering procrastination", 5);

  if (ranked.length > 0) {
    const topMatch = ranked[0];
    console.log(`   Top ranked template: ${topMatch.title} (Relevance Score: ${topMatch.relevanceScore}/100)`);
    console.log("   ✅ PASS: Template ranked successfully.");
  } else {
    console.error("   ❌ FAIL: Template ranking returned empty!");
    pass = false;
  }

  // 5. Test Prompt Builder
  console.log("\n4. Testing Meme Generation Prompt Builder...");
  const { buildMemeGenerationPrompt } = await import("../src/server/services/meme-engine/prompt-builder");
  const prompt = buildMemeGenerationPrompt(brandContext, ranked, {
    topic: "Engineering procrastination",
    count: 2,
    tone: "witty",
  });

  if (prompt.includes("Acme Corp") && prompt.includes("procrastination") && prompt.includes("Distracted Boyfriend")) {
    console.log("   ✅ PASS: Prompt assembled correctly with brand and template contexts.");
  } else {
    console.error("   ❌ FAIL: Prompt construction failed!", prompt);
    pass = false;
  }

  // 6. Test Sharp Server-side Meme Renderer
  console.log("\n5. Testing Sharp Server-side Meme Renderer...");
  const { renderMemeImage } = await import("../src/server/services/meme-engine/meme-renderer.service");
  
  try {
    const buffer = await renderMemeImage({
      templateImageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      topText: "TESTING TOP TEXT",
      bottomText: "TESTING BOTTOM TEXT",
      textLayout: "top_bottom",
      watermarkEnabled: true, // test watermark overlay composition
    });

    if (buffer && buffer.length > 0) {
      console.log(`   ✅ PASS: Sharp successfully rendered standard top/bottom meme (Buffer size: ${buffer.length} bytes).`);
    } else {
      console.error("   ❌ FAIL: Rendered buffer is empty!");
      pass = false;
    }

    // Test region-based coordinate rendering
    const regionBuffer = await renderMemeImage({
      templateImageUrl: "https://res.cloudinary.com/demo/image/upload/v1312461204/sample.jpg",
      textLayout: "regions",
      regionCaptions: {
        "left_button": "Write clean code",
        "right_button": "Copy paste",
      },
      regions: [
        { id: "left_button", x: 30, y: 25, width: 20, height: 10, angle: -5 },
        { id: "right_button", x: 70, y: 25, width: 20, height: 10, angle: -5 }
      ],
      watermarkEnabled: true,
    });

    if (regionBuffer && regionBuffer.length > 0) {
      console.log(`   ✅ PASS: Sharp successfully rendered coordinate-based region meme (Buffer size: ${regionBuffer.length} bytes).`);
    } else {
      console.error("   ❌ FAIL: Region-based rendered buffer is empty!");
      pass = false;
    }
  } catch (err) {
    console.error("   ❌ FAIL: Meme rendering exception!", err);
    pass = false;
  }

  // 7. Cleanup Test Records
  console.log("\n6. Cleaning up test data from database...");
  await db.delete(memes).where(eq(memes.brand_id, testBrand.id)).catch(() => null);
  await db.delete(memeGenerations).where(eq(memeGenerations.brand_id, testBrand.id)).catch(() => null);
  await db.delete(brandKnowledgeBases).where(eq(brandKnowledgeBases.brand_id, testBrand.id)).catch(() => null);
  await db.delete(brands).where(eq(brands.id, testBrand.id)).catch(() => null);
  await db.delete(templates).where(eq(templates.id, template1.id)).catch(() => null);
  await db.delete(templates).where(eq(templates.id, template2.id)).catch(() => null);
  await db.delete(users).where(eq(users.id, testUser.id)).catch(() => null);

  console.log("   ✅ Test data purged.");

  console.log("\n=========================================");
  if (pass) {
    console.log("🎉 ALL MEME GENERATION ENGINE TESTS PASSED!");
  } else {
    console.error("❌ MEME GENERATION ENGINE TESTS FAILED!");
  }
  console.log("=========================================");

  if (!pass) process.exit(1);
}

runMemeEngineTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Test execution exception:", err);
    process.exit(1);
  });
