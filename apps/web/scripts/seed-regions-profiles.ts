const dotenv = require("dotenv");
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

async function seed() {
  const { db } = await import("@virlio/database");
  const { templates } = await import("@virlio/database/schema");
  const { eq } = await import("drizzle-orm");

  console.log("Seeding AI generation profiles for templates...");

  // 1. Red Button Panic
  const redButtonId = "66e3dbd2-1cd9-442d-96e5-199e8aef6546";
  const redButtonProfile = {
    humorType: "Satirical / Relatable",
    textLayout: "regions",
    memeStyle: "Comparison / Choice Conflict",
    emotion: "Anxious / Sweating",
    preferredCaptionLength: "short",
    requiresKnowledge: false,
    regions: [
      {
        id: "left_button",
        name: "Left Option",
        x: 28,
        y: 20,
        width: 25,
        height: 15,
        angle: -8,
        description: "The first conflicting option or button label (e.g., 'Fix the bug in production')"
      },
      {
        id: "right_button",
        name: "Right Option",
        x: 68,
        y: 18,
        width: 25,
        height: 15,
        angle: -8,
        description: "The second conflicting option or button label (e.g., 'Go to sleep')"
      },
      {
        id: "character_label",
        name: "Sweating character label",
        x: 50,
        y: 88,
        width: 80,
        height: 15,
        description: "The person, entity, or group struggling to make this decision (e.g., 'Junior Developer')"
      }
    ]
  };

  await db
    .update(templates)
    .set({
      text_layout: "regions",
      ai_generation_profile: redButtonProfile
    })
    .where(eq(templates.id, redButtonId));
  console.log("Updated Red Button Panic profile.");

  // 2. Uno Draw 25
  const unoId = "617937c8-3387-45a9-902a-3a7f58b5e5f4";
  const unoProfile = {
    humorType: "Self-deprecating / Absurd",
    textLayout: "regions",
    memeStyle: "Stubborn Decision / Choice",
    emotion: "Defiant",
    preferredCaptionLength: "short",
    requiresKnowledge: false,
    regions: [
      {
        id: "card_text",
        name: "Card Challenge",
        x: 26,
        y: 28,
        width: 32,
        height: 20,
        angle: 6,
        description: "The action written on the Uno card that the person refuses to do (e.g., 'Wear outdated clothes')"
      },
      {
        id: "player_label",
        name: "Player Label",
        x: 70,
        y: 64,
        width: 45,
        height: 15,
        angle: 0,
        description: "The person or entity who would rather draw 25 cards instead of doing that action (e.g., 'You')"
      }
    ]
  };

  await db
    .update(templates)
    .set({
      text_layout: "regions",
      ai_generation_profile: unoProfile
    })
    .where(eq(templates.id, unoId));
  console.log("Updated Uno Draw 25 profile.");

  // 3. Drake Orange Jacket Split
  const drakeId = "1496e6a8-7c55-4e6c-b1a6-14a8ca97ca7a";
  const drakeProfile = {
    humorType: "Relatable / Comparative",
    textLayout: "regions",
    memeStyle: "Dislike/Like Preference",
    emotion: "Expressive / Opinionated",
    preferredCaptionLength: "short",
    requiresKnowledge: false,
    regions: [
      {
        id: "panel_reject_text",
        name: "Rejected Practice",
        x: 72,
        y: 25,
        width: 45,
        height: 35,
        angle: 0,
        description: "The top panel option that Drake dislikes or disapproves of."
      },
      {
        id: "panel_approve_text",
        name: "Approved Practice",
        x: 72,
        y: 75,
        width: 45,
        height: 35,
        angle: 0,
        description: "The bottom panel option that Drake likes or approves of."
      }
    ]
  };

  await db
    .update(templates)
    .set({
      text_layout: "regions",
      ai_generation_profile: drakeProfile
    })
    .where(eq(templates.id, drakeId));
  console.log("Updated Drake Orange Jacket Split profile.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
