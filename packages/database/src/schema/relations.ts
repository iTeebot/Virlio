import { relations } from "drizzle-orm";
import { users, accounts, sessions } from "./auth";
import { brands, brandMembers, brandDrafts, brandKnowledgeBases, brandVerifications, brandInvitations, brandAuditLogs, brandTaxonomies, brandAiHistory } from "./brands";
import { templates } from "./templates";
import { memes } from "./memes";
import { memeGenerations } from "./meme-generations";
import { comments, votes, bookmarks } from "./engagement";
import { follows } from "./social";
import { badges, userBadges, brandBadges, achievements, userAchievements, streaks, xpEvents, userLevels } from "./gamification";
import { reports } from "./moderation";
import { activities, notifications } from "./activity";
import { userStats, brandStats } from "./stats";
import { cloudAssets } from "./storage";
import {
  brandGenerationSessions,
  brandPostGenerations,
  brandPostVariations,
  brandPostImageVersions,
  brandGenerationMemories,
} from "./brand-posts";

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  ownedBrands: many(brands, { relationName: "BrandOwner" }),
  brandMemberships: many(brandMembers),
  templates: many(templates, { relationName: "TemplateUploader" }),
  memes: many(memes, { relationName: "MemeGenerator" }),
  comments: many(comments),
  votes: many(votes),
  bookmarks: many(bookmarks),
  followers: many(follows, { relationName: "UserFollowers" }),
  following: many(follows, { relationName: "UserFollowing" }),
  userBadges: many(userBadges),
  userAchievements: many(userAchievements),
  streaks: many(streaks),
  xpEvents: many(xpEvents),
  userLevel: one(userLevels, { fields: [users.id], references: [userLevels.user_id] }),
  reports: many(reports, { relationName: "UserReports" }),
  moderatedReports: many(reports, { relationName: "ModeratorReports" }),
  activities: many(activities),
  notifications: many(notifications),
  userStats: one(userStats, { fields: [users.id], references: [userStats.user_id] }),
  assets: many(cloudAssets),
  drafts: many(brandDrafts),
  memeGenerations: many(memeGenerations),
  postSessions: many(brandGenerationSessions),
  postGenerations: many(brandPostGenerations),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const brandsRelations = relations(brands, ({ one, many }) => ({
  owner: one(users, { fields: [brands.owner_id], references: [users.id], relationName: "BrandOwner" }),
  members: many(brandMembers),
  memes: many(memes),
  brandBadges: many(brandBadges),
  stats: one(brandStats, { fields: [brands.id], references: [brandStats.brand_id] }),
  knowledgeBase: one(brandKnowledgeBases, { fields: [brands.id], references: [brandKnowledgeBases.brand_id] }),
  verification: one(brandVerifications, { fields: [brands.id], references: [brandVerifications.brand_id] }),
  invitations: many(brandInvitations),
  auditLogs: many(brandAuditLogs),
  memeGenerations: many(memeGenerations),
  aiHistory: many(brandAiHistory),
  postSessions: many(brandGenerationSessions),
  postGenerations: many(brandPostGenerations),
  postVariations: many(brandPostVariations),
  generationMemories: many(brandGenerationMemories),
}));

export const brandMembersRelations = relations(brandMembers, ({ one }) => ({
  brand: one(brands, { fields: [brandMembers.brand_id], references: [brands.id] }),
  user: one(users, { fields: [brandMembers.user_id], references: [users.id] }),
}));

export const brandDraftsRelations = relations(brandDrafts, ({ one }) => ({
  user: one(users, { fields: [brandDrafts.user_id], references: [users.id] }),
}));

export const brandKnowledgeBasesRelations = relations(brandKnowledgeBases, ({ one }) => ({
  brand: one(brands, { fields: [brandKnowledgeBases.brand_id], references: [brands.id] }),
}));

export const brandVerificationsRelations = relations(brandVerifications, ({ one }) => ({
  brand: one(brands, { fields: [brandVerifications.brand_id], references: [brands.id] }),
}));

export const brandInvitationsRelations = relations(brandInvitations, ({ one }) => ({
  brand: one(brands, { fields: [brandInvitations.brand_id], references: [brands.id] }),
  inviter: one(users, { fields: [brandInvitations.invited_by], references: [users.id] }),
}));

export const brandAuditLogsRelations = relations(brandAuditLogs, ({ one }) => ({
  brand: one(brands, { fields: [brandAuditLogs.brand_id], references: [brands.id] }),
  user: one(users, { fields: [brandAuditLogs.user_id], references: [users.id] }),
}));

export const templatesRelations = relations(templates, ({ one, many }) => ({
  uploader: one(users, { fields: [templates.uploaded_by], references: [users.id], relationName: "TemplateUploader" }),
  memes: many(memes),
}));

export const memesRelations = relations(memes, ({ one }) => ({
  brand: one(brands, { fields: [memes.brand_id], references: [brands.id] }),
  template: one(templates, { fields: [memes.template_id], references: [templates.id] }),
  generator: one(users, { fields: [memes.generator_id], references: [users.id], relationName: "MemeGenerator" }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  user: one(users, { fields: [comments.user_id], references: [users.id] }),
  parent: one(comments, { fields: [comments.parent_id], references: [comments.id], relationName: "CommentReplies" }),
  replies: many(comments, { relationName: "CommentReplies" }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, { fields: [votes.user_id], references: [users.id] }),
}));

export const bookmarksRelations = relations(bookmarks, ({ one }) => ({
  user: one(users, { fields: [bookmarks.user_id], references: [users.id] }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, { fields: [follows.follower_id], references: [users.id], relationName: "UserFollowing" }),
}));

export const badgesRelations = relations(badges, ({ many }) => ({
  userBadges: many(userBadges),
  brandBadges: many(brandBadges),
}));

export const userBadgesRelations = relations(userBadges, ({ one }) => ({
  user: one(users, { fields: [userBadges.user_id], references: [users.id] }),
  badge: one(badges, { fields: [userBadges.badge_id], references: [badges.id] }),
}));

export const brandBadgesRelations = relations(brandBadges, ({ one }) => ({
  brand: one(brands, { fields: [brandBadges.brand_id], references: [brands.id] }),
  badge: one(badges, { fields: [brandBadges.badge_id], references: [badges.id] }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(userAchievements, ({ one }) => ({
  user: one(users, { fields: [userAchievements.user_id], references: [users.id] }),
  achievement: one(achievements, { fields: [userAchievements.achievement_id], references: [achievements.id] }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
  user: one(users, { fields: [streaks.user_id], references: [users.id] }),
}));

export const xpEventsRelations = relations(xpEvents, ({ one }) => ({
  user: one(users, { fields: [xpEvents.user_id], references: [users.id] }),
}));

export const userLevelsRelations = relations(userLevels, ({ one }) => ({
  user: one(users, { fields: [userLevels.user_id], references: [users.id] }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  reporter: one(users, { fields: [reports.reporter_id], references: [users.id], relationName: "UserReports" }),
  moderator: one(users, { fields: [reports.moderator_id], references: [users.id], relationName: "ModeratorReports" }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.user_id], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.user_id], references: [users.id] }),
}));

export const userStatsRelations = relations(userStats, ({ one }) => ({
  user: one(users, { fields: [userStats.user_id], references: [users.id] }),
}));

export const brandStatsRelations = relations(brandStats, ({ one }) => ({
  brand: one(brands, { fields: [brandStats.brand_id], references: [brands.id] }),
}));

export const cloudAssetsRelations = relations(cloudAssets, ({ one, many }) => ({
  owner: one(users, { fields: [cloudAssets.owner_id], references: [users.id] }),
  imageVersions: many(brandPostImageVersions),
}));

export const memeGenerationsRelations = relations(memeGenerations, ({ one }) => ({
  brand: one(brands, { fields: [memeGenerations.brand_id], references: [brands.id] }),
  user: one(users, { fields: [memeGenerations.user_id], references: [users.id] }),
}));

export const brandAiHistoryRelations = relations(brandAiHistory, ({ one }) => ({
  brand: one(brands, { fields: [brandAiHistory.brand_id], references: [brands.id] }),
  user: one(users, { fields: [brandAiHistory.user_id], references: [users.id] }),
}));

// --- Brand Post System Relations ---

export const brandGenerationSessionsRelations = relations(brandGenerationSessions, ({ one, many }) => ({
  brand: one(brands, { fields: [brandGenerationSessions.brand_id], references: [brands.id] }),
  user: one(users, { fields: [brandGenerationSessions.user_id], references: [users.id] }),
  generations: many(brandPostGenerations),
  variations: many(brandPostVariations),
  memories: many(brandGenerationMemories),
}));

export const brandPostGenerationsRelations = relations(brandPostGenerations, ({ one, many }) => ({
  session: one(brandGenerationSessions, { fields: [brandPostGenerations.session_id], references: [brandGenerationSessions.id] }),
  brand: one(brands, { fields: [brandPostGenerations.brand_id], references: [brands.id] }),
  user: one(users, { fields: [brandPostGenerations.user_id], references: [users.id] }),
  variations: many(brandPostVariations),
}));

export const brandPostVariationsRelations = relations(brandPostVariations, ({ one, many }) => ({
  generation: one(brandPostGenerations, { fields: [brandPostVariations.generation_id], references: [brandPostGenerations.id] }),
  session: one(brandGenerationSessions, { fields: [brandPostVariations.session_id], references: [brandGenerationSessions.id] }),
  brand: one(brands, { fields: [brandPostVariations.brand_id], references: [brands.id] }),
  imageVersions: many(brandPostImageVersions),
  activeVersion: one(brandPostImageVersions, { fields: [brandPostVariations.active_version_id], references: [brandPostImageVersions.id] }),
}));

export const brandPostImageVersionsRelations = relations(brandPostImageVersions, ({ one, many }) => ({
  variation: one(brandPostVariations, { fields: [brandPostImageVersions.variation_id], references: [brandPostVariations.id] }),
  parentVersion: one(brandPostImageVersions, { fields: [brandPostImageVersions.parent_version_id], references: [brandPostImageVersions.id], relationName: "ImageVersionTree" }),
  childVersions: many(brandPostImageVersions, { relationName: "ImageVersionTree" }),
  asset: one(cloudAssets, { fields: [brandPostImageVersions.asset_id], references: [cloudAssets.id] }),
}));

export const brandGenerationMemoriesRelations = relations(brandGenerationMemories, ({ one }) => ({
  session: one(brandGenerationSessions, { fields: [brandGenerationMemories.session_id], references: [brandGenerationSessions.id] }),
  brand: one(brands, { fields: [brandGenerationMemories.brand_id], references: [brands.id] }),
}));
