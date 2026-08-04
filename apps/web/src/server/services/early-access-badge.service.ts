import { badgeRepository } from "@/server/repositories";

export const EARLY_ACCESS_CUTOFF_DATE = new Date("2026-09-30T23:59:59.999Z");
export const EARLY_ACCESS_BADGE_SLUG = "early-adopter";

export class EarlyAccessBadgeService {
  /**
   * Server-side check for Early Access badge eligibility.
   * Uses trusted server database creation timestamp.
   * Client-side timestamps or payloads are strictly ignored.
   */
  public isEligible(userCreatedAt: Date): boolean {
    if (!userCreatedAt || !(userCreatedAt instanceof Date) || isNaN(userCreatedAt.getTime())) {
      return false;
    }
    return userCreatedAt.getTime() <= EARLY_ACCESS_CUTOFF_DATE.getTime();
  }

  /**
   * Award Early Access badge idempotently to eligible users.
   */
  public async evaluateAndAward(userId: string, userCreatedAt: Date): Promise<{ awarded: boolean; reason: string }> {
    if (!this.isEligible(userCreatedAt)) {
      return {
        awarded: false,
        reason: "Account created after the Early Access campaign cutoff date (September 30, 2026 23:59:59 UTC).",
      };
    }

    try {
      const hasBadge = await badgeRepository.hasBadge(userId, EARLY_ACCESS_BADGE_SLUG);
      if (hasBadge) {
        return { awarded: true, reason: "Early Access badge already awarded." };
      }

      await badgeRepository.awardBadgeBySlug(userId, EARLY_ACCESS_BADGE_SLUG);
      return { awarded: true, reason: "Early Access badge awarded successfully." };
    } catch (err: any) {
      console.error(`[EarlyAccessBadge] Error awarding badge to user ${userId}:`, err);
      return { awarded: false, reason: err.message || "Error awarding Early Access badge." };
    }
  }
}

export const earlyAccessBadgeService = new EarlyAccessBadgeService();
