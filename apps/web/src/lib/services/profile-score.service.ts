import { userStatsEngine } from "@/server/services/user-stats-engine.service";

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
  const stats = await userStatsEngine.getUserStatistics(userId);

  return {
    score: stats.trustScore,
    maxScore: 100,
    percentage: stats.trustScore,
    breakdown: stats.trustBreakdown,
    connectedProviders: stats.connectedProviders,
  };
}
