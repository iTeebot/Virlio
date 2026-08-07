"use client";

import React, { useState, useEffect } from "react";
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
  Edit3,
  BarChart3,
  Loader2,
} from "lucide-react";

import { useTemplateVote } from "@/hooks/useTemplateVote";
import { validateSafetyAndProfanity } from "@/lib/validations/safety-filter";

export interface ExplorePost {
  id: string;
  generator_id?: string | null;
  title: string;
  description?: string | null;
  hashtags?: string[] | null;
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
  user_voted?: "up" | "down" | "upvote" | "downvote" | null;
  user_bookmarked?: boolean;
}

interface ExplorePostCardProps {
  post: ExplorePost;
  onRequireAuth: (promptMessage?: string) => void;
}

export function ExplorePostCard({ post, onRequireAuth }: ExplorePostCardProps) {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const isOwner = session?.user?.id === post.generator_id;

  const {
    upvotesCount: upvotes,
    currentUserVote,
    isLiked,
    isDisliked,
    isPending,
    handleVote: triggerVote,
  } = useTemplateVote(post.id, {
    upvotes_count: post.upvotes_count,
    user_voted: post.user_voted,
  });

  const [isBookmarked, setIsBookmarked] = useState(!!post.user_bookmarked);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  // Edit fields state
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title || "");
  const [editDescription, setEditDescription] = useState(post.description || "");
  const [editHashtags, setEditHashtags] = useState(post.hashtags ? post.hashtags.join(" ") : "");
  
  // Display fields state (for syncing everywhere instantly in the feed UI)
  const [displayTitle, setDisplayTitle] = useState(post.title || "Untitled Meme");
  const [displayDescription, setDisplayDescription] = useState(post.description || "");
  const [displayHashtags, setDisplayHashtags] = useState(post.hashtags || []);

  const [improvingTitle, setImprovingTitle] = useState(false);
  const [improvingDescription, setImprovingDescription] = useState(false);
  const [improvingTags, setImprovingTags] = useState(false);
  const [savingEdits, setSavingEdits] = useState(false);

  /** Calls /api/v1/memes/improve for a single field, optionally passing the current value */
  const callImproveField = async (
    field: "title" | "description" | "hashtags",
    setLoading: (v: boolean) => void,
    currentValue?: string
  ) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/memes/improve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: post.id, field, currentValue }),
      });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        if (field === "title" && json.data.title) setEditTitle(json.data.title);
        if (field === "description" && json.data.description) setEditDescription(json.data.description);
        if (field === "hashtags") {
          const tags: string[] = Array.isArray(json.data.hashtags) ? json.data.hashtags : [];
          if (tags.length > 0) setEditHashtags(tags.slice(0, 25).join(" "));
        }
      } else {
        alert(json.error || "AI generation failed");
      }
    } catch {
      alert("Network error. Could not reach AI service.");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!isAuthenticated) {
      onRequireAuth("Sign in to upvote memes and support creators.");
      return;
    }
    if (isPending) return;
    await triggerVote(type);
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

    const check = validateSafetyAndProfanity(commentText);
    if (!check.isValid) {
      alert(`Comment declined: ${check.reason}`);
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

  const handleSaveEdits = async () => {
    setSavingEdits(true);
    const tags = editHashtags
      .split(/[\s,]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
      .map((t) => (t.startsWith("#") ? t : "#" + t));

    try {
      const res = await fetch(`/api/v1/memes`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: post.id,
          title: editTitle,
          description: editDescription,
          hashtags: tags,
        }),
      });

      if (res.ok) {
        setDisplayTitle(editTitle);
        setDisplayDescription(editDescription);
        setDisplayHashtags(tags);
        setIsEditing(false);
      } else {
        const json = await res.json();
        alert(json.error || "Failed to save changes");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Failed to save changes.");
    } finally {
      setSavingEdits(false);
    }
  };


  const brandName = post.brand_name || post.author_name || "Virlio Creator";
  const brandSlug = post.brand_slug || "virlio";

  // Live relative time — refreshes every 60 s so "just now" / "2 min ago" etc. is always fresh
  const [relativeTime, setRelativeTime] = useState("");
  useEffect(() => {
    const compute = () => {
      const diff = Math.floor((Date.now() - new Date(post.created_at).getTime()) / 1000);
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
      if (diff < 86400) {
        // Show exact clock time for today
        return new Date(post.created_at).toLocaleTimeString(undefined, {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        });
      }
      return new Date(post.created_at).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    };
    setRelativeTime(compute());
    const interval = setInterval(() => setRelativeTime(compute()), 60_000);
    return () => clearInterval(interval);
  }, [post.created_at]);

  const authorDisplayName = post.author_name || (post.author_username ? `@${post.author_username}` : "Virlio Creator");
  const authorProfileHref = post.author_username ? `/profiles/${post.author_username}` : null;

  return (
    <article
      id={post.id}
      className="virlio-card p-5 sm:p-6 bg-white border border-gray-200 rounded-3xl shadow-xs hover:border-gray-300 transition-colors"
    >
      {/* 1. Header: Author / Brand metadata */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar links to brand page */}
          <Link href={`/brands/${brandSlug}`} className="shrink-0">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-blue-50 border border-blue-100 flex items-center justify-center">
              {post.brand_avatar ? (
                <Image src={post.brand_avatar} alt={brandName} fill unoptimized sizes="40px" className="object-cover" />
              ) : (
                <Building2 className="w-5 h-5 text-blue-600" />
              )}
            </div>
          </Link>

          {/* Brand name + byline — these are siblings, never nested */}
          <div>
            <div className="flex items-center gap-1.5">
              <Link
                href={`/brands/${brandSlug}`}
                className="text-sm font-bold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {brandName}
              </Link>
              {post.verified && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
            </div>
            {/* Byline — author name link is standalone, NOT nested inside any other anchor */}
            <p className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
              <span>Published by</span>
              {authorProfileHref ? (
                <Link
                  href={authorProfileHref}
                  className="font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  {authorDisplayName}
                </Link>
              ) : (
                <span className="font-semibold text-gray-700">{authorDisplayName}</span>
              )}
              <span>•</span>
              <span>{relativeTime}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isOwner && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>{isEditing ? "Cancel" : "Edit Post"}</span>
            </button>
          )}

          {post.category && (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
              {post.category}
            </span>
          )}
        </div>
      </div>

      {/* 2. Content Body: Title, Text Caption & Meme Media */}
      <div className="space-y-3 mb-4">
        {isEditing ? (
          <div className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-2xl">
            {/* Title Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Meme Title</label>
                <button
                  type="button"
                  disabled={improvingTitle}
                  onClick={() => callImproveField("title", setImprovingTitle, editTitle)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {improvingTitle ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /><span>Generating...</span></>
                  ) : editTitle.trim() ? (
                    <><Sparkles className="w-3 h-3" /><span>Improve Title</span></>
                  ) : (
                    <><Sparkles className="w-3 h-3" /><span>Generate Title</span></>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs font-bold text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-600"
                placeholder="Enter meme title..."
              />
            </div>

            {/* Description Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Meme Description</label>
                <button
                  type="button"
                  disabled={improvingDescription}
                  onClick={() => callImproveField("description", setImprovingDescription, editDescription)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {improvingDescription ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /><span>Generating...</span></>
                  ) : editDescription.trim() ? (
                    <><Sparkles className="w-3 h-3" /><span>Improve Description</span></>
                  ) : (
                    <><Sparkles className="w-3 h-3" /><span>Generate Description</span></>
                  )}
                </button>
              </div>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-xs text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-600 resize-none"
                placeholder="Write a humorous description..."
              />
            </div>

            {/* Hashtags Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Hashtags</label>
                  <span className={`text-[10px] font-bold ${
                    editHashtags.split(/[\s,]+/).filter(t => t.trim()).length > 25 ? "text-red-500" : "text-gray-400"
                  }`}>
                    {editHashtags.split(/[\s,]+/).filter(t => t.trim()).length}/25
                  </span>
                </div>
                <button
                  type="button"
                  disabled={improvingTags}
                  onClick={() => callImproveField("hashtags", setImprovingTags)}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {improvingTags ? (
                    <><Loader2 className="w-3 h-3 animate-spin" /><span>Generating...</span></>
                  ) : (
                    <><Sparkles className="w-3 h-3" /><span>Generate Tags</span></>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={editHashtags}
                onChange={(e) => {
                  const raw = e.target.value;
                  const tags = raw.split(/[\s,]+/).filter(t => t.trim());
                  if (tags.length <= 25) setEditHashtags(raw);
                }}
                className="w-full px-3 py-2 text-xs font-mono text-gray-900 border border-gray-200 rounded-xl bg-white focus:outline-none focus:border-blue-600"
                placeholder="#marketing #saas #funny (max 25)"
              />
            </div>

            {/* Save / Cancel */}
            <div className="pt-2 border-t border-gray-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdits}
                disabled={savingEdits}
                className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                {savingEdits ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Save Changes</span>}
              </button>
            </div>
            
            {/* Analytics Summary */}
            <div className="pt-4 mt-2 border-t border-gray-200 space-y-2">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-500" />
                <span>Meme Reach & Engagement</span>
              </h4>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-white border border-gray-150 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Est. Views</span>
                  <span className="text-sm font-black text-gray-900 mt-0.5 block">
                    {Math.max(12, (upvotes * 7) + 5)}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-gray-150 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Upvotes</span>
                  <span className="text-sm font-black text-blue-600 mt-0.5 block">{upvotes}</span>
                </div>
                <div className="p-2.5 bg-white border border-gray-150 rounded-xl">
                  <span className="text-[9px] font-bold text-gray-400 block uppercase">Conversion</span>
                  <span className="text-sm font-black text-emerald-600 mt-0.5 block">
                    {((upvotes / Math.max(12, (upvotes * 7) + 5)) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
              {displayTitle}
            </h2>

            {displayDescription && (
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {displayDescription}
              </p>
            )}

            {displayHashtags && displayHashtags.length > 0 && (
              <p className="text-xs font-mono text-blue-600 flex flex-wrap gap-1.5 pt-0.5">
                {displayHashtags.map((tag) => (
                  <span key={tag}>{tag.startsWith("#") ? tag : `#${tag}`}</span>
                ))}
              </p>
            )}
          </>
        )}

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
              alt={displayTitle}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 700px"
              className="object-contain"
            />
          ) : (
            <div className="text-center p-6 text-gray-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-xs font-mono">{displayTitle}</p>
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
            disabled={isPending}
            onClick={() => handleVote("upvote")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all ${
              isLiked
                ? "bg-blue-50 text-blue-600 border-blue-200 font-bold"
                : "bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200/80"
            }`}
            aria-label="Upvote post"
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "text-blue-600" : ""}`} />
            <span>{upvotes}</span>
          </button>

          {/* Downvote */}
          <button
            type="button"
            disabled={isPending}
            onClick={() => handleVote("downvote")}
            className={`p-1.5 rounded-xl border transition-all ${
              isDisliked
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
