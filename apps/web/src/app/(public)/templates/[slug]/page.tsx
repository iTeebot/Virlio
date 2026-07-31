"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import {
  ThumbsUp,
  ThumbsDown,
  Download,
  Share2,
  CheckCircle2,
  Globe,
  ArrowRight,
  ArrowLeft,
  Flag,
  Sparkles,
  Image as ImageIcon,
  Loader2,
  AlertTriangle,
  X,
  Check,
} from "lucide-react";

interface TemplateDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  subcategory: string;
  country: string;
  language: string;
  tags: string[];
  cloudinary_secure_url: string;
  upvotes_count: number;
  downloads_count: number;
  contributor_username: string;
  is_approved?: boolean;
}

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = (params?.slug as string) || "";

  const [template, setTemplate] = useState<TemplateDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Voting & Interaction State
  const [userVoted, setUserVoted] = useState<"upvote" | "downvote" | null>(null);
  const [upvotesCount, setUpvotesCount] = useState(0);
  const [downloadsCount, setDownloadsCount] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Report Modal
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("inappropriate_content");
  const [reportNotes, setReportNotes] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    async function fetchDetail() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/v1/templates/${slug}`);
        if (!res.ok) {
          throw new Error("Template not found or unreachable");
        }
        const json = await res.json();
        const data = json.data || json;
        setTemplate(data);
        setUpvotesCount(data.upvotes_count || 0);
        setDownloadsCount(data.downloads_count || 0);
      } catch (err: any) {
        setError(err.message || "Failed to load template details");
      } finally {
        setLoading(false);
      }
    }

    fetchDetail();
  }, [slug]);

  const handleVote = async (type: "upvote" | "downvote") => {
    if (!template) return;

    try {
      const res = await fetch(`/api/v1/templates/${template.id}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType: type }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/templates/${slug}`)}`);
        return;
      }

      if (res.ok) {
        let delta = 0;
        if (userVoted === type) {
          setUserVoted(null);
          delta = type === "upvote" ? -1 : 1;
        } else if (userVoted) {
          setUserVoted(type);
          delta = type === "upvote" ? 2 : -2;
        } else {
          setUserVoted(type);
          delta = type === "upvote" ? 1 : -1;
        }
        setUpvotesCount((prev) => Math.max(0, prev + delta));
      }
    } catch {
      // Fail silently
    }
  };

  const handleDownload = async () => {
    if (!template || !template.cloudinary_secure_url) return;

    // Trigger API to increment count
    fetch(`/api/v1/templates/${template.id}/download`, { method: "POST" }).catch(() => null);
    setDownloadsCount((prev) => prev + 1);

    // Trigger browser file download
    try {
      const imgRes = await fetch(template.cloudinary_secure_url);
      const blob = await imgRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${template.slug || "virlio-template"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(template.cloudinary_secure_url, "_blank");
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!template) return;

    setIsReporting(true);
    setReportError(null);

    try {
      const res = await fetch(`/api/v1/templates/${template.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, explanation: reportNotes }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/templates/${slug}`)}`);
        return;
      }

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to submit report");
      }

      setReportSuccess(true);
      setTimeout(() => setReportModalOpen(false), 1500);
    } catch (err: any) {
      setReportError(err.message || "Failed to submit report.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Link
              href="/templates"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Templates Library</span>
            </Link>
          </div>

          {loading ? (
            <div className="virlio-surface p-12 border border-gray-200 text-center space-y-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
              <p className="text-sm font-semibold text-gray-600">Loading Meme Template Details...</p>
            </div>
          ) : error || !template ? (
            <div className="virlio-surface p-12 border border-rose-200 bg-rose-50 text-center space-y-4 rounded-3xl">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <h2 className="text-xl font-bold text-gray-900">Template Not Found</h2>
              <p className="text-xs text-gray-600">{error || "The requested template could not be located."}</p>
              <Link
                href="/templates"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700"
              >
                Browse All Templates
              </Link>
            </div>
          ) : (
            <div className="virlio-surface p-6 sm:p-10 border border-gray-200 grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Meme Template Image Preview Box */}
              <div className="lg:col-span-6 bg-slate-100 rounded-2xl border border-slate-200 aspect-[4/3] flex items-center justify-center p-4">
                {template.cloudinary_secure_url ? (
                  <img
                    src={template.cloudinary_secure_url}
                    alt={template.title}
                    className="max-h-full max-w-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                    <ImageIcon className="w-12 h-12 text-slate-300" />
                    <span className="text-xs font-medium">No Image Preview Available</span>
                  </div>
                )}
              </div>

              {/* Template Info & Actions */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {template.category}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>AI Verified</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setReportModalOpen(true);
                        setReportError(null);
                        setReportSuccess(false);
                      }}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Report Template"
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight mb-3">
                    {template.title}
                  </h1>

                  <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-4">
                    {template.description || "Verified community meme template format ready for AI meme generation and brand campaigns."}
                  </p>

                  <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4 mb-4">
                    <p>
                      <span className="font-semibold text-gray-900">Contributor:</span>{" "}
                      <Link href={`/profiles/${template.contributor_username || "creator"}`} className="text-blue-600 hover:underline font-bold">
                        @{template.contributor_username || "creator"}
                      </Link>
                    </p>
                    <p>
                      <span className="font-semibold text-gray-900">Taxonomy:</span> {template.category} {template.subcategory ? `• ${template.subcategory}` : ""}
                    </p>
                    <p className="flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-gray-400" /> {template.country || "Global"} • {template.language || "any"}
                    </p>
                  </div>

                  {template.tags && template.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {template.tags.map((t, idx) => (
                        <span key={idx} className="text-xs text-blue-800 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 font-semibold">
                          #{t.replace(/^#/, "")}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Toolbar */}
                <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {/* Upvote / Downvote buttons */}
                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                      <button
                        type="button"
                        onClick={() => handleVote("upvote")}
                        className={`p-2 rounded-lg transition-colors flex items-center gap-1 font-semibold ${
                          userVoted === "upvote" ? "bg-blue-600 text-white" : "text-slate-700 hover:bg-slate-200"
                        }`}
                        title="Upvote Template"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{upvotesCount}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleVote("downvote")}
                        className={`p-2 rounded-lg transition-colors ${
                          userVoted === "downvote" ? "bg-rose-600 text-white" : "text-slate-500 hover:bg-slate-200"
                        }`}
                        title="Downvote Template"
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Download Button */}
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                      title="Download Template Asset"
                    >
                      <Download className="w-4 h-4 text-slate-500" />
                      <span>{downloadsCount} Downloads</span>
                    </button>

                    {/* Share Button */}
                    <button
                      type="button"
                      onClick={handleShare}
                      className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                      title="Share Link"
                    >
                      {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                    </button>
                  </div>

                  <Link
                    href={`/dashboard/generator?template=${template.id}`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-sm"
                  >
                    <span>Use This Template</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Report Template Modal */}
      {reportModalOpen && template && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Template</span>
              </div>
              <button
                type="button"
                onClick={() => setReportModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-gray-900">Report Submitted</p>
                <p className="text-xs text-gray-600">Report saved to database for moderation inspection.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-gray-600">
                  Reporting: <strong className="text-gray-900">{template.title}</strong>
                </p>

                {reportError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs">
                    {reportError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="inappropriate_content">Inappropriate / Unsafe Content</option>
                    <option value="copyright_violation">Copyright Violation</option>
                    <option value="misleading_metadata">Misleading Tags / Metadata</option>
                    <option value="spam_duplicate">Spam / Duplicate Upload</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Additional Context (Optional)</label>
                  <textarea
                    value={reportNotes}
                    onChange={(e) => setReportNotes(e.target.value)}
                    rows={3}
                    placeholder="Provide details for moderation team..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalOpen(false)}
                    className="px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isReporting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-semibold text-white transition-colors"
                  >
                    {isReporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
