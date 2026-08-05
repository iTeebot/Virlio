export interface PublishMemeOptions {
  memeId: string;
  brandId: string;
  pageId: string;
  accessToken: string;
  caption?: string;
  tags?: string[];
  imageUrl?: string;
  videoUrl?: string;
  appendAttribution?: boolean;
  automationId?: string;
  userId?: string;
}

export interface PublishResult {
  success: boolean;
  externalPostId?: string;
  postUrl?: string;
  error?: string;
}

export interface BaseSocialAdapter {
  platform: string;
  publish(options: PublishMemeOptions): Promise<PublishResult>;
}
