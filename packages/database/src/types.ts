import { InferSelectModel, InferInsertModel } from "drizzle-orm";
import * as schema from "./schema";

export type User = InferSelectModel<typeof schema.users>;
export type NewUser = InferInsertModel<typeof schema.users>;

export type Account = InferSelectModel<typeof schema.accounts>;
export type NewAccount = InferInsertModel<typeof schema.accounts>;

export type Session = InferSelectModel<typeof schema.sessions>;
export type NewSession = InferInsertModel<typeof schema.sessions>;

export type VerificationToken = InferSelectModel<typeof schema.verificationTokens>;
export type NewVerificationToken = InferInsertModel<typeof schema.verificationTokens>;

export type Brand = InferSelectModel<typeof schema.brands>;
export type NewBrand = InferInsertModel<typeof schema.brands>;

export type BrandMember = InferSelectModel<typeof schema.brandMembers>;
export type NewBrandMember = InferInsertModel<typeof schema.brandMembers>;

export type BrandDraft = InferSelectModel<typeof schema.brandDrafts>;
export type NewBrandDraft = InferInsertModel<typeof schema.brandDrafts>;

export type BrandKnowledgeBase = InferSelectModel<typeof schema.brandKnowledgeBases>;
export type NewBrandKnowledgeBase = InferInsertModel<typeof schema.brandKnowledgeBases>;

export type BrandVerification = InferSelectModel<typeof schema.brandVerifications>;
export type NewBrandVerification = InferInsertModel<typeof schema.brandVerifications>;

export type BrandInvitation = InferSelectModel<typeof schema.brandInvitations>;
export type NewBrandInvitation = InferInsertModel<typeof schema.brandInvitations>;

export type BrandAuditLog = InferSelectModel<typeof schema.brandAuditLogs>;
export type NewBrandAuditLog = InferInsertModel<typeof schema.brandAuditLogs>;

export type BrandTaxonomy = InferSelectModel<typeof schema.brandTaxonomies>;
export type NewBrandTaxonomy = InferInsertModel<typeof schema.brandTaxonomies>;

export type Template = InferSelectModel<typeof schema.templates>;
export type NewTemplate = InferInsertModel<typeof schema.templates>;

export type Meme = InferSelectModel<typeof schema.memes>;
export type NewMeme = InferInsertModel<typeof schema.memes>;

export type Vote = InferSelectModel<typeof schema.votes>;
export type NewVote = InferInsertModel<typeof schema.votes>;

export type Bookmark = InferSelectModel<typeof schema.bookmarks>;
export type NewBookmark = InferInsertModel<typeof schema.bookmarks>;

export type Comment = InferSelectModel<typeof schema.comments>;
export type NewComment = InferInsertModel<typeof schema.comments>;

export type Follow = InferSelectModel<typeof schema.follows>;
export type NewFollow = InferInsertModel<typeof schema.follows>;

export type Badge = InferSelectModel<typeof schema.badges>;
export type NewBadge = InferInsertModel<typeof schema.badges>;

export type UserBadge = InferSelectModel<typeof schema.userBadges>;
export type NewUserBadge = InferInsertModel<typeof schema.userBadges>;

export type BrandBadge = InferSelectModel<typeof schema.brandBadges>;
export type NewBrandBadge = InferInsertModel<typeof schema.brandBadges>;

export type Achievement = InferSelectModel<typeof schema.achievements>;
export type NewAchievement = InferInsertModel<typeof schema.achievements>;

export type UserAchievement = InferSelectModel<typeof schema.userAchievements>;
export type NewUserAchievement = InferInsertModel<typeof schema.userAchievements>;

export type Streak = InferSelectModel<typeof schema.streaks>;
export type NewStreak = InferInsertModel<typeof schema.streaks>;

export type XpEvent = InferSelectModel<typeof schema.xpEvents>;
export type NewXpEvent = InferInsertModel<typeof schema.xpEvents>;

export type UserLevel = InferSelectModel<typeof schema.userLevels>;
export type NewUserLevel = InferInsertModel<typeof schema.userLevels>;

export type Report = InferSelectModel<typeof schema.reports>;
export type NewReport = InferInsertModel<typeof schema.reports>;

export type Activity = InferSelectModel<typeof schema.activities>;
export type NewActivity = InferInsertModel<typeof schema.activities>;

export type Notification = InferSelectModel<typeof schema.notifications>;
export type NewNotification = InferInsertModel<typeof schema.notifications>;

export type UserStats = InferSelectModel<typeof schema.userStats>;
export type NewUserStats = InferInsertModel<typeof schema.userStats>;

export type BrandStats = InferSelectModel<typeof schema.brandStats>;
export type NewBrandStats = InferInsertModel<typeof schema.brandStats>;

export type CloudAsset = InferSelectModel<typeof schema.cloudAssets>;
export type NewCloudAsset = InferInsertModel<typeof schema.cloudAssets>;

export type TemplateModerationLog = InferSelectModel<typeof schema.templateModerationLogs>;
export type NewTemplateModerationLog = InferInsertModel<typeof schema.templateModerationLogs>;
