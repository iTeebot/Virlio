"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ExploreHeader } from "@/components/explore/explore-header";
import { ExplorePostCard, ExplorePost } from "@/components/explore/explore-post-card";
import { AuthPromptModal } from "@/components/explore/auth-prompt-modal";
import {
  Flame,
  Tag,
  Building2,
  Trophy,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Compass,
  Layers,
} from "lucide-react";

import { useTemplateStore } from "@/providers/template-provider";

export default function ExplorePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const { syncTemplates } = useTemplateStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Trending");
  const [posts, setPosts] = useState<ExplorePost[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // Auth Prompt Modal State
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalText, setAuthModalText] = useState({ title: "", desc: "" });

  // IntersectionObserver Sentinel Ref
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const handleRequireAuth = useCallback((promptMessage?: string) => {
    setAuthModalText({
      title: "Sign in to interact",
      desc: promptMessage || "Join Virlio to upvote memes, save templates, and engage with verified brands.",
    });
    setAuthModalOpen(true);
  }, []);

  // Fetch initial posts on page load or filter change
  const fetchFeed = useCallback(async (isInitial = false) => {
    const currentOffset = isInitial ? 0 : offset;
    if (isInitial) {
      setInitialLoading(true);
      setOffset(0);
      setHasMore(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await fetch(`/api/v1/memes?limit=10&offset=${currentOffset}`);
      if (res.ok) {
        const json = await res.json();
        const fetchedMemes = json.data || json;

        if (Array.isArray(fetchedMemes) && fetchedMemes.length > 0) {
          const formatted: ExplorePost[] = fetchedMemes.map((m: any, idx: number) => ({
            id: m.id || `meme-${currentOffset + idx}`,
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
            created_at: m.created_at || new Date().toISOString(),
            currentUserVote: m.currentUserVote || m.user_vote || (m.user_voted ? (m.user_voted === "up" || m.user_voted === "upvote" ? "upvote" : "downvote") : null),
          }));

          syncTemplates(formatted as any);

          setPosts((prev) => {
            if (isInitial) return formatted;
            const existingIds = new Set(prev.map((p) => p.id));
            const uniqueNew = formatted.filter((p) => !existingIds.has(p.id));
            return [...prev, ...uniqueNew];
          });
          setOffset(currentOffset + fetchedMemes.length);
          if (fetchedMemes.length < 10) setHasMore(false);
        } else {
          if (isInitial) setPosts([]);
          setHasMore(false);
        }
      }
    } catch (err) {
      if (isInitial) setPosts([]);
    } finally {
      setInitialLoading(false);
      setIsLoadingMore(false);
    }
  }, [offset, syncTemplates]);

  useEffect(() => {
    fetchFeed(true);
  }, []);

  // Setup IntersectionObserver for Infinite Scroll
  useEffect(() => {
    const target = observerTarget.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore && !initialLoading) {
          fetchFeed(false);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(target);
    return () => observer.unobserve(target);
  }, [fetchFeed, hasMore, isLoadingMore, initialLoading]);

  // Filter & Search handling
  const filteredPosts = posts.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand_name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. Standalone Minimal Explore Navigation Header (No Global App Header!) */}
      <ExploreHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* 2. Main Public Social Feed Shell */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Public Feed Column (8 Cols Desktop / 100% Mobile) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Feed Header Tagline */}
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h1 className="text-lg font-bold text-gray-900 tracking-tight">
                  {activeFilter} Public Feed
                </h1>
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {filteredPosts.length} items
              </span>
            </div>

            {/* Initial Loading Skeletons */}
            {initialLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="aspect-video w-full rounded-2xl bg-gray-200" />
                  </div>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              /* Clean Empty State when 0 posts exist in database */
              <div className="virlio-card p-8 sm:p-12 bg-white border border-gray-200 rounded-3xl text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
                  <Layers className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    No public memes created yet
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto">
                    Be the first creator or brand to generate and publish a viral meme to the Virlio community!
                  </p>
                </div>

                <div className="pt-2">
                  {isAuthenticated ? (
                    <Link
                      href="/dashboard/generator"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Generate First Meme</span>
                    </Link>
                  ) : (
                    <Link
                      href="/login?callbackUrl=/dashboard/generator"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Sign In to Generate Meme</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              /* Dynamic Real Database Posts Stream */
              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <ExplorePostCard
                    key={post.id}
                    post={post}
                    onRequireAuth={handleRequireAuth}
                  />
                ))}
              </div>
            )}

            {/* Infinite Loading Skeleton Indicator */}
            {isLoadingMore && (
              <div className="space-y-6 pt-4">
                {[1, 2].map((n) => (
                  <div
                    key={n}
                    className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl animate-pulse space-y-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-200" />
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/3" />
                        <div className="h-3 bg-gray-100 rounded w-1/4" />
                      </div>
                    </div>
                    <div className="h-5 bg-gray-200 rounded w-3/4" />
                    <div className="aspect-video w-full rounded-2xl bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            {/* IntersectionObserver Sentinel Target */}
            {filteredPosts.length > 0 && <div ref={observerTarget} className="h-10 w-full" />}

            {/* End of Feed State */}
            {!hasMore && filteredPosts.length > 0 && (
              <div className="text-center py-8 text-xs text-gray-500 font-semibold space-y-2">
                <Compass className="w-6 h-6 text-blue-600 mx-auto" />
                <p>You're all caught up! You've reached the end of the public feed.</p>
                <button
                  type="button"
                  onClick={() => fetchFeed(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100 font-bold transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Feed</span>
                </button>
              </div>
            )}
          </div>

          {/* Desktop Right Sidebar Column (4 Cols Desktop / Hidden on Mobile) */}
          <aside className="hidden lg:block lg:col-span-4 space-y-6">
            {/* Session Aware CTA Card */}
            <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  {isAuthenticated ? "Your Virlio Workspace" : "Build Your Brand Virality"}
                </h3>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {isAuthenticated
                    ? "Manage your verified brand profiles, generate AI memes, and upload community templates."
                    : "Turn your business into viral content with AI meme generation, verified profiles, and automated publishing."}
                </p>
              </div>

              {isAuthenticated ? (
                <div className="space-y-2 pt-1">
                  <Link
                    href="/dashboard/generator"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Meme</span>
                  </Link>

                  <Link
                    href="/dashboard/overview"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors"
                  >
                    <span>Go to Dashboard</span>
                  </Link>
                </div>
              ) : (
                <Link
                  href="/register?callbackUrl=/explore"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors"
                >
                  <span>Create Free Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>

            {/* Leaderboard Highlight */}
            <div className="virlio-card p-5 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>Leaderboard Highlights</span>
              </h3>
              <div className="space-y-2.5 text-xs text-gray-500">
                <div className="flex items-center justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-600 font-medium">Top Contributor:</span>
                  <span className="text-gray-400 italic text-[11px]">No rankings yet</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-gray-600 font-medium">Top Verified Brand:</span>
                  <span className="text-gray-400 italic text-[11px]">No rankings yet</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* 3. Non-Intrusive Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        title={authModalText.title}
        description={authModalText.desc}
      />
    </div>
  );
}
