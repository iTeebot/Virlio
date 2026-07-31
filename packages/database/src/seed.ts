import { db } from "./client";
import { badges, achievements } from "./schema";

async function main() {
  console.log("🌱 Seeding initial system badges and achievements...");

  // Seed default system badges
  const systemBadges = [
    {
      name: "Top Contributor",
      slug: "top-contributor",
      description: "Awarded to top meme template creators in the community.",
      category: "contribution" as const,
      level: 1,
      iconUrl: "/images/badges/badge_Top_Contributer.png",
      visibility: "public" as const,
    },
    {
      name: "Hall of Fame",
      slug: "hall-of-fame",
      description: "Recognized as an legendary content contributor.",
      category: "special" as const,
      level: 5,
      iconUrl: "/images/badges/badge_Hall_of_Fame.png",
      visibility: "public" as const,
    },
    {
      name: "100-Day Streak",
      slug: "100-day-streak",
      description: "Maintained a 100-day consecutive creation streak.",
      category: "streak" as const,
      level: 3,
      iconUrl: "/images/badges/badge_Top_Contributer.png",
      visibility: "public" as const,
    },
  ];

  for (const b of systemBadges) {
    await db.insert(badges).values(b).onConflictDoNothing();
  }

  // Seed default achievements
  const systemAchievements = [
    {
      name: "First Meme Generated",
      slug: "first-meme-generated",
      description: "Generated your very first brand meme on Virlio.",
      category: "creation",
      targetValue: 1,
      iconUrl: "/images/badges/badge_Top_Contributer.png",
    },
    {
      name: "Template Master",
      slug: "template-master",
      description: "Upload 10 community templates that pass AI moderation.",
      category: "templates",
      targetValue: 10,
      iconUrl: "/images/badges/badge_Hall_of_Fame.png",
    },
  ];

  for (const a of systemAchievements) {
    await db.insert(achievements).values(a).onConflictDoNothing();
  }

  console.log("✅ Database seed completed successfully.");
}

main().catch((err) => {
  console.error("❌ Database seed failed:", err);
  process.exit(1);
});
