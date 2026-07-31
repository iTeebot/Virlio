"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Bookmark,
  Share2,
  CheckCircle2,
  Building2,
  Sparkles,
  Send,
} from "lucide-react";

export interface ExplorePost {
  id: string;
  title: string;
  top_text?: string | null;
  bottom_text?: string | null;
  image_url?: string | null;
  brand_name?: string | null;
  brand_slug?: string | null;
  brand_avatar?: string | null;
  verified?: boolean;
  category?: string | null;
  author_name?: string | null;
  author_username?: string | null;
  upvotes_count: number;
  comments_count: number;
  created_at: string | Date;
  user_voted?: "up" | "down" | null;
  user_bookmarked?: boolean;
}

interface ExplorePostCardProps {
  post: ExplorePost;
  onRequireAuth: (promptMessage?: string) => void;
}

export function ExplorePostCard({ post, onRequireAuth }: ExplorePostCardProps) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [upvotes, setUpvotes] = useState(post.upvotes_count || 0);
  const [voteState, setVoteState] = useState<"up" | "down" | null>(post.user_voted || null);
  const [isBookmarked, setIsBookmarked] = useState(!!post.user_bookmarked);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([
    { id: "c1", user: "growth_guru", text: "Hilarious and so accurate for SaaS marketing! 😂", time: "1h ago" },
  ]);
  const [copiedShare, setCopiedShare] = useState(false);

  const handleVote = async (type: "up" | "down") => {
    if (!isAuthenticated) {
      onRequireAuth("Sign in to upvote memes and support creators.");
      return;
    }

    // Optimistic state update
    if (voteState === type) {
      // Remove vote
      setVoteState(null);
      setUpvotes((prev) => (type === "up" ? prev - 1 : prev));
      try {
        await fetch(`/api/v1/votes?entityType=meme&entityId=${post.id}`, { method: "DELETE" });
      } catch (err) {
        // Rollback
        setVoteState(type);
        setUpvotes((prev) => (type === "up" ? prev + 1 : prev));
      }
    } else {
      // Add or switch vote
      const prevVote = voteState;
      setVoteState(type);
      setUpvotes((prev) => {
        if (prevVote === "up" && type === "down") return prev - 1;
        if (prevVote === null && type === "up") return prev + 1;
        return prev;
      });

      try {
        await fetch("/api/v1/votes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            entity_type: "meme",
            entity_id: post.id,
            vote_type: type,
          }),
        });
      } catch (err) {
        // Rollback
        setVoteState(prevVote);
      }
    }
  };

  const handleBookmark = () => {
    if (!isAuthenticated) {
      onRequireAuth("Sign in to save memes to your bookmarks.");
      return;
    }
    setIsBookmarked(!isBookmarked);
  };

  const handleCommentToggle = () => {
    if (!isAuthenticated && !showComments) {
      onRequireAuth("Sign in to view and post comments.");
      return;
    }
    setShowComments(!showComments);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!isAuthenticated) {
      onRequireAuth("Sign in to join the discussion.");
      return;
    }

    setComments((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        user: "You",
        text: commentText.trim(),
        time: "Just now",
      },
    ]);
    setCommentText("");
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/explore#${post.id}`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const brandName = post.brand_name || post.author_name || "Virlio Creator";
  const brandSlug = post.brand_slug || "virlio";
  const formattedTime = new Date(post.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <article
      id={post.id}
      className="virlio-card p-5 sm:p-6 bg-white border border-gray-200 rounded-3xl shadow-xs hover:border-gray-300 transition-colors"
    >
      {/* 1. Header: Author / Brand metadata */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Link href={`/brands/${brandSlug}`} className="group flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
              {post.brand_avatar ? (
                <Image src={post.brand_avatar} alt={brandName} fill unoptimized className="object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-blue-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {brandName}
                </span>
                {post.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-xs text-gray-500">
                {post.author_username ? `@${post.author_username}` : "Verified Brand"} • {formattedTime}
              </p>
            </div>
          </Link>
        </div>

        {post.category && (
          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
            {post.category}
          </span>
        )}
      </div>

      {/* 2. Content Body: Title, Text Caption & Meme Media */}
      <div className="space-y-3 mb-4">
        <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
          {post.title}
        </h2>

        {(post.top_text || post.bottom_text) && (
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-800 space-y-1">
            {post.top_text && <p>"{post.top_text}"</p>}
            {post.bottom_text && <p className="text-gray-500">"{post.bottom_text}"</p>}
          </div>
        )}

        {/* Meme Image Container */}
        <div className="relative aspect-video w-full rounded-2xl bg-gray-900 overflow-hidden border border-gray-200 flex items-center justify-center">
          {post.image_url ? (
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-contain"
            />
          ) : (
            <div className="text-center p-6 text-gray-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-xs font-mono">{post.title}</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Interaction Row: Upvote, Downvote, Comment, Bookmark, Share */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs font-semibold text-gray-600">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Upvote */}
          <button
            type="button"
            onClick={() => handleVote("up")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              voteState === "up"
                ? "bg-blue-50 text-blue-600 border-blue-200 font-bold"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200/80"
            }`}
            aria-label="Upvote post"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${voteState === "up" ? "text-blue-600" : ""}`} />
            <span>{upvotes}</span>
          </button>

          {/* Downvote */}
          <button
            type="button"
            onClick={() => handleVote("down")}
            className={`p-1.5 rounded-xl border transition-all ${
              voteState === "down"
                ? "bg-red-50 text-red-600 border-red-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200/80"
            }`}
            aria-label="Downvote post"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
          </button>

          {/* Comment Button */}
          <button
            type="button"
            onClick={handleCommentToggle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200/80 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-gray-400" />
            <span>{comments.length}</span>
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Bookmark */}
          <button
            type="button"
            onClick={handleBookmark}
            className={`p-2 rounded-xl border transition-colors ${
              isBookmarked
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 border-gray-200/80"
            }`}
            title="Save to bookmarks"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-400 hover:text-gray-700 border border-gray-200/80 transition-colors relative"
            title="Share post"
          >
            <Share2 className="w-4 h-4" />
            {copiedShare && (
              <span className="absolute -top-8 right-0 px-2 py-0.5 rounded bg-gray-900 text-white text-[10px] whitespace-nowrap">
                Link copied!
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 4. Inline Comments Box */}
      {showComments && (
        <div className="mt-4 pt-4 border-t border-gray-100 space-y-3 animate-in fade-in duration-200">
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {comments.map((c) => (
              <div key={c.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                <div className="flex items-center justify-between text-[11px] text-gray-500 mb-0.5">
                  <span className="font-bold text-gray-900">@{c.user}</span>
                  <span>{c.time}</span>
                </div>
                <p className="text-gray-800">{c.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
            <input
              type="text"
              placeholder="Write a public comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 bg-white"
            />
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </article>
  );
}
