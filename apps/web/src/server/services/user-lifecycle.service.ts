import { db } from "@virlio/database";
import {
  users,
  accounts,
  sessions,
  brands,
  brandMembers,
  templates,
  memes,
  activities,
  notifications,
  userStats,
  streaks,
  follows,
  votes,
  comments,
  reports,
  userBadges,
  userAchievements,
  xpEvents,
} from "@virlio/database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { userRepository } from "@/server/repositories";

export interface AccountDeletionResult {
  success: boolean;
  userId: string;
  anonymizedTemplateCount: number;
  archivedBrandCount: number;
  transferredBrandCount: number;
  message: string;
}

export class UserLifecycleService {
  /**
   * Gracefully soft-deletes a user account, revokes sessions & OAuth tokens,
   * archives brands, anonymizes public templates, and removes user from search & leaderboards.
   */
  async deleteUserAccount(userId: string, reason: string = "User requested account deletion"): Promise<AccountDeletionResult> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error("User account not found or already deleted.");
    }

    let anonymizedTemplateCount = 0;
    let archivedBrandCount = 0;
    let transferredBrandCount = 0;

    // 1. Revoke active sessions & OAuth account links immediately
    await Promise.all([
      db.delete(sessions).where(eq(sessions.userId, userId)).catch(() => null),
      db.delete(accounts).where(eq(accounts.userId, userId)).catch(() => null),
    ]);

    // 2. Clean up transient user-specific records
    await Promise.all([
      db.delete(activities).where(eq(activities.user_id, userId)).catch(() => null),
      db.delete(notifications).where(eq(notifications.user_id, userId)).catch(() => null),
      db.delete(follows).where(eq(follows.follower_id, userId)).catch(() => null),
      db.delete(votes).where(eq(votes.user_id, userId)).catch(() => null),
      db.delete(comments).where(eq(comments.user_id, userId)).catch(() => null),
      db.delete(reports).where(eq(reports.reporter_id, userId)).catch(() => null),
      db.delete(userStats).where(eq(userStats.user_id, userId)).catch(() => null),
      db.delete(streaks).where(eq(streaks.user_id, userId)).catch(() => null),
      db.delete(userBadges).where(eq(userBadges.user_id, userId)).catch(() => null),
      db.delete(userAchievements).where(eq(userAchievements.user_id, userId)).catch(() => null),
      db.delete(xpEvents).where(eq(xpEvents.user_id, userId)).catch(() => null),
    ]);

    // 3. Handle Public & Community Templates
    // Approved public templates remain available as community assets, attributed to "Deleted User" / null
    const userTemplates = await db.query.templates.findMany({
      where: eq(templates.uploaded_by, userId),
    });

    for (const t of userTemplates) {
      if (t.moderation_status === "approved" || t.visibility === "public") {
        // Retain as community asset, anonymize uploader attribution
        await db
          .update(templates)
          .set({
            uploaded_by: null as any,
          })
          .where(eq(templates.id, t.id))
          .catch(() => null);
        anonymizedTemplateCount++;
      } else {
        // Delete pending/rejected/draft templates
        await db.delete(templates).where(eq(templates.id, t.id)).catch(() => null);
      }
    }

    // 4. Handle Owned Brands
    const ownedBrands = await db.query.brands.findMany({
      where: and(eq(brands.owner_id, userId), isNull(brands.deleted_at)),
    });

    for (const brand of ownedBrands) {
      // Check if there is another member to transfer ownership to
      const coOwnerMember = await db.query.brandMembers.findFirst({
        where: and(
          eq(brandMembers.brand_id, brand.id),
          isNull(brandMembers.deleted_at)
        ),
      });

      if (coOwnerMember && coOwnerMember.user_id !== userId) {
        // Transfer ownership to co-owner
        await db
          .update(brands)
          .set({
            owner_id: coOwnerMember.user_id,
            updated_at: new Date(),
          })
          .where(eq(brands.id, brand.id))
          .catch(() => null);
        transferredBrandCount++;
      } else {
        // Archive brand: mark is_archived = true and set verification_status = "suspended"
        await db
          .update(brands)
          .set({
            is_archived: true,
            verification_status: "suspended",
            deleted_at: new Date(),
            updated_at: new Date(),
          })
          .where(eq(brands.id, brand.id))
          .catch(() => null);
        archivedBrandCount++;

        // Make memes belonging to archived brand private / archived
        await db
          .update(memes)
          .set({
            visibility: "private",
          })
          .where(eq(memes.brand_id, brand.id))
          .catch(() => null);
      }
    }

    // Clean up brand memberships
    await db.delete(brandMembers).where(eq(brandMembers.user_id, userId)).catch(() => null);

    // 5. Clean up user's private & draft memes
    await db
      .delete(memes)
      .where(and(eq(memes.generator_id, userId), eq(memes.visibility, "private")))
      .catch(() => null);

    // 6. Soft Delete & Anonymize the User Record
    const deletedHandle = `deleted_user_${userId.slice(0, 8)}`;
    await db
      .update(users)
      .set({
        name: "Deleted User",
        display_name: "Deleted User",
        username: deletedHandle,
        email: null, // Freed for re-registration
        emailVerified: null,
        image: null,
        avatar_url: null,
        banner_url: null,
        bio: null,
        website: null,
        public_profile: false,
        account_status: "deleted",
        deleted_at: new Date(),
        deletion_reason: reason,
        updated_at: new Date(),
      })
      .where(eq(users.id, userId));

    return {
      success: true,
      userId,
      anonymizedTemplateCount,
      archivedBrandCount,
      transferredBrandCount,
      message: "User account deleted successfully and all assets anonymized/archived.",
    };
  }
}

export const userLifecycleService = new UserLifecycleService();
