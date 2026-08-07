import React from "react";
import { authService, memeService } from "@/server/services";
import { memeRepository } from "@/server/repositories";
import { ExploreFeedClient } from "@/components/explore/explore-feed-client";
import type { ExplorePost } from "@/components/explore/explore-post-card";

export const metadata = {
  title: "Explore Viral Memes — Virlio Public Feed",
  description: "Browse trending AI-generated memes, community templates, and verified brand social posts on Virlio.",
};

export default async function ExplorePage() {
  const session = await authService.getCurrentSession();
  const isAuthenticated = Boolean(session?.user?.id);

  // Fetch initial 10 public memes directly on the server
  const rawMemes = await memeRepository.findPublicMemes({ limit: 10, offset: 0 });

  const initialMemes: ExplorePost[] = (rawMemes || []).map((m: any, idx: number) => ({
    id: m.id || `meme-${idx}`,
    generator_id: m.generator_id,
    title: m.title || m.top_text || m.bottom_text || "Untitled Meme",
    description: m.description,
    hashtags: m.generated_hashtags,
    top_text: m.top_text,
    bottom_text: m.bottom_text,
    image_url: m.cloudinary_secure_url || m.image_url || null,
    brand_name: m.brand?.name || m.brand_name || "Verified Brand",
    brand_slug: m.brand?.slug || m.brand_slug || "virlio",
    brand_avatar: m.brand?.logo_url || m.brand_avatar || null,
    verified: m.brand?.verification_status === "verified" || m.verified || false,
    category: m.category || "General",
    author_name: m.generator?.name || null,
    author_username: m.generator?.username || null,
    upvotes_count: m.upvotes_count || 0,
    comments_count: 0,
    created_at: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
    currentUserVote: m.currentUserVote || null,
  }));

  return <ExploreFeedClient initialMemes={initialMemes} isAuthenticated={isAuthenticated} />;
}
