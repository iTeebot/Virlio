"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ThumbsUp,
  Download,
  CheckCircle2,
  Globe,
  ArrowRight,
  Layers,
  Sparkles,
  Flag,
  Tag,
  ExternalLink,
} from "lucide-react";
import { toast } from "@/components/ui/toast";

import { useTemplateStore } from "@/providers/template-provider";
import { useTemplateVote } from "@/hooks/useTemplateVote";

interface TemplateItem {
  id: string;
  title: string;
  slug?: string;
  category: string;
  subcategory?: string;
  country?: string;
  language?: string;
  cloudinary_secure_url?: string;
  image_url?: string;
  tags?: string[];
  upvotes_count?: number;
  downloads_count?: number;
  contributor_username?: string;
  is_approved?: boolean;
  currentUserVote?: "upvote" | "downvote" | null;
  user_vote?: "upvote" | "downvote" | null;
  user_voted?: "up" | "down" | "upvote" | "downvote" | null;
  user_has_voted?: boolean;
}

function PreviewTemplateCard({
  tpl,
  downloadingId,
  onDownload,
}: {
  tpl: TemplateItem;
  downloadingId: string | null;
  onDownload: (tpl: TemplateItem) => void;
}) {
  const {
    upvotesCount,
    isLiked,
    isPending,
    handleVote,
  } = useTemplateVote(tpl.id, {
    upvotes_count: tpl.upvotes_count,
    currentUserVote: tpl.currentUserVote,
    user_vote: tpl.user_vote,
    user_voted: tpl.user_voted,
    user_has_voted: tpl.user_has_voted,
  });

  const detailUrl = `/templates/${tpl.slug || tpl.id}`;

  return (
    <div className="virlio-card p-5 flex flex-col justify-between bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <div>
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/templates?category=${encodeURIComponent(tpl.category.toLowerCase().replace(/\s+/g, "-"))}`}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
          >
            <Tag className="w-3 h-3" />
            <span>{tpl.category}</span>
          </Link>

          {tpl.is_approved !== false && (
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>AI Approved</span>
            </div>
          )}
        </div>

        <Link
          href={detailUrl}
          className="block aspect-video bg-slate-100 rounded-xl overflow-hidden mb-3 border border-slate-200 p-2 flex items-center justify-center group"
        >
          {tpl.cloudinary_secure_url || tpl.image_url ? (
            <img
              src={tpl.cloudinary_secure_url || tpl.image_url}
              alt={tpl.title}
              className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-xs">No Image Preview</span>
            </div>
          )}
        </Link>

        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
          <Link href={detailUrl} className="hover:text-blue-600 transition">
            {tpl.title}
          </Link>
        </h3>

        <div className="space-y-1.5 text-xs text-gray-600 mb-4">
          <p className="flex items-center gap-1.5">
            <span className="font-semibold text-gray-700">Subcategory:</span> {tpl.subcategory || "General"}
          </p>
          <p className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-gray-400" />
            <span>{tpl.country || "Global"} • {tpl.language || "English"}</span>
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <Link
          href={`/profiles/${tpl.contributor_username || "creator"}`}
          className="text-gray-600 hover:text-blue-600 font-semibold hover:underline transition"
        >
          By @{tpl.contributor_username || "creator"}
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleVote("upvote")}
            disabled={isPending}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
              isLiked
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
            }`}
          >
            <ThumbsUp className={`w-3.5 h-3.5 ${isLiked ? "fill-current" : "text-blue-600"}`} />
            <span>{upvotesCount}</span>
          </button>

          <button
            onClick={() => onDownload(tpl)}
            disabled={downloadingId === tpl.id}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
          >
            <Download className="w-3.5 h-3.5 text-gray-600" />
            <span>{tpl.downloads_count || 0}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplatesPreview() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const { syncTemplates } = useTemplateStore();

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/templates?limit=6");
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (Array.isArray(data) && data.length > 0) {
            setTemplates(data);
            syncTemplates(data);
          } else {
            setTemplates([]);
          }
        }
      } catch (err) {
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTemplates();
  }, [syncTemplates]);

  const handleDownload = async (tpl: TemplateItem) => {
    const imageUrl = tpl.cloudinary_secure_url || tpl.image_url;
    if (!imageUrl) return;

    setDownloadingId(tpl.id);
    try {
      // 1. Record download count on server
      fetch(`/api/v1/templates/${tpl.id}/download`, { method: "POST" }).catch(() => {});
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === tpl.id ? { ...t, downloads_count: (t.downloads_count || 0) + 1 } : t
        )
      );

      // 2. Trigger browser file download
      const imgRes = await fetch(imageUrl);
      const blob = await imgRes.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${tpl.title.toLowerCase().replace(/\s+/g, "-")}-template.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template download started!");
    } catch (err) {
      window.open(imageUrl, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleReport = (tplTitle: string) => {
    toast.info(`Flagged "${tplTitle}" for moderation review.`, "Report Submitted");
  };

  return (
    <section id="templates" className="py-20 bg-gray-50 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-blue-600 mb-2">
            Community Template Library
          </h2>
          <p className="text-3xl font-bold text-gray-900 sm:text-4xl tracking-tight">
            Explore High-Performing Meme Templates
          </p>
          <p className="mt-3 text-base text-gray-600">
            Categorized by industry, subcategory, country, and verified community approval.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl animate-pulse space-y-4"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-20 bg-gray-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          /* Clean Empty State when 0 templates exist in database */
          <div className="virlio-card p-8 sm:p-12 bg-white border border-gray-200 rounded-3xl text-center space-y-4 max-w-2xl mx-auto shadow-xs">
            <div className="relative w-48 h-48 mx-auto">
              <Image
                src="/images/empty_state/no_templates.png"
                alt="No Templates Illustration"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                No community templates uploaded yet
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-md mx-auto leading-relaxed">
                Be the first creator or brand contributor to upload a meme template to the Virlio ecosystem!
              </p>
            </div>

            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard/templates/upload"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upload First Template</span>
              </Link>
              <Link
                href="/dashboard/generator"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors"
              >
                <span>Generate Meme</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Dynamic Real Templates Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((tpl) => (
              <PreviewTemplateCard
                key={tpl.id}
                tpl={tpl}
                downloadingId={downloadingId}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-6 py-3.5 text-sm font-semibold text-white transition-colors shadow-xs"
          >
            <span>View All Templates</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
