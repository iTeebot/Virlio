import { userRepository, accountRepository } from "@/server/repositories";

export interface ScoreItem {
  id: string;
  name: string;
  category: "identity" | "profile" | "verification";
  points: number;
  achieved: boolean;
  description: string;
}

export interface ProfileScoreResult {
  score: number; // 0 to 100
  maxScore: number;
  percentage: number;
  breakdown: ScoreItem[];
  connectedProviders: string[];
}

export async function calculateProfileScore(userId: string): Promise<ProfileScoreResult> {
  const [user, userAccounts] = await Promise.all([
    userRepository.findById(userId),
    accountRepository.findByUserId(userId),
  ]);

  if (!user) {
    return {
      score: 0,
      maxScore: 100,
      percentage: 0,
      breakdown: [],
      connectedProviders: [],
    };
  }

  const connectedProviders = userAccounts.map((a) => a.provider.toLowerCase());

  const items: ScoreItem[] = [
    {
      id: "email_verified",
      name: "Verified Email Address",
      category: "verification",
      points: 15,
      achieved: !!user.emailVerified,
      description: "Confirmed ownership of primary email",
    },
    {
      id: "github_connected",
      name: "GitHub Developer Identity",
      category: "identity",
      points: 20,
      achieved: connectedProviders.includes("github"),
      description: "Linked GitHub developer account",
    },
    {
      id: "linkedin_connected",
      name: "LinkedIn Professional Identity",
      category: "identity",
      points: 20,
      achieved: connectedProviders.includes("linkedin"),
      description: "Linked LinkedIn professional account",
    },
    {
      id: "google_connected",
      name: "Google Account Identity",
      category: "identity",
      points: 10,
      achieved: connectedProviders.includes("google"),
      description: "Linked Google user account",
    },
    {
      id: "facebook_connected",
      name: "Facebook Social Identity",
      category: "identity",
      points: 10,
      achieved: connectedProviders.includes("facebook"),
      description: "Linked Facebook social account",
    },
    {
      id: "username_set",
      name: "Custom Username Handle",
      category: "profile",
      points: 10,
      achieved: !!user.username && user.username.length >= 3,
      description: "Configured unique @username handle",
    },
    {
      id: "avatar_configured",
      name: "Profile Photo / Avatar",
      category: "profile",
      points: 10,
      achieved: !!(user.image || user.avatar_url),
      description: "Uploaded profile avatar picture",
    },
    {
      id: "bio_configured",
      name: "Creator Bio",
      category: "profile",
      points: 5,
      achieved: !!(user.bio && user.bio.trim().length > 0),
      description: "Added profile bio description",
    },
  ];

  const rawScore = items.filter((i) => i.achieved).reduce((sum, item) => sum + item.points, 0);
  const finalScore = Math.min(100, rawScore);

  // Synchronize calculated trust_score in database if changed
  if (user.trust_score !== finalScore) {
    await userRepository.update(userId, { trust_score: finalScore }).catch(() => null);
  }

  return {
    score: finalScore,
    maxScore: 100,
    percentage: finalScore,
    breakdown: items,
    connectedProviders,
  };
}
