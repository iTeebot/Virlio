import { pgEnum } from "drizzle-orm/pg-core";

export const accountStatusEnum = pgEnum("account_status", ["active", "suspended", "banned", "deactivated"]);
export const accountTypeEnum = pgEnum("account_type", ["personal", "business", "agency"]);
export const roleEnum = pgEnum("role", ["user", "contributor", "brand_owner", "moderator", "admin"]);
export const verificationStatusEnum = pgEnum("verification_status", ["pending", "verified", "rejected", "suspended"]);
export const visibilityEnum = pgEnum("visibility", ["public", "private", "unlisted"]);
export const moderationStatusEnum = pgEnum("moderation_status", ["pending", "approved", "rejected", "flagged"]);
export const voteTypeEnum = pgEnum("vote_type", ["upvote", "downvote"]);
export const reportReasonEnum = pgEnum("report_reason", ["spam", "duplicate", "nudity", "violence", "illegal", "copyright", "harassment", "hate_speech", "misinformation", "other"]);
export const reportStatusEnum = pgEnum("report_status", ["pending", "reviewed", "resolved", "dismissed"]);
export const activityTypeEnum = pgEnum("activity_type", ["joined", "brand_created", "brand_verified", "meme_generated", "template_uploaded", "template_approved", "template_rejected", "badge_earned", "achievement_unlocked", "level_up", "streak_milestone", "followed_user", "followed_brand"]);
export const notificationTypeEnum = pgEnum("notification_type", ["system", "moderation", "achievement", "follower", "comment", "vote", "report", "verification", "brand_update", "ai_recommendation"]);
export const entityTypeEnum = pgEnum("entity_type", ["user", "brand", "template", "meme", "comment"]);
export const brandRoleEnum = pgEnum("brand_role", ["owner", "manager", "editor"]);
export const streakCategoryEnum = pgEnum("streak_category", ["login", "meme_generation", "template_upload", "community_contribution", "moderation", "engagement"]);
export const badgeCategoryEnum = pgEnum("badge_category", ["contribution", "streak", "engagement", "moderation", "special"]);

