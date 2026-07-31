"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Download,
  CheckCircle2,
  Globe,
  ArrowRight,
  Filter,
  X,
  AlertTriangle,
  Loader2,
  Layers,
  Sparkles,
  Image as ImageIcon,
  Info,
} from "lucide-react";

interface TemplateItem {
  id: string;
  slug?: string;
  title: string;
  category: string;
  subcategory?: string;
  country?: string;
  language?: string;
  tags?: string[];
  cloudinary_secure_url?: string;
  upvotes_count?: number;
  downloads_count?: number;
  contributor_username?: string;
  is_approved?: boolean;
  public_score?: number;
}

export default function TemplatesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Voting state mapping
  const [votedMap, setVotedMap] = useState<Record<string, "upvote" | "downvote" | null>>({});

  // Report Modal
  const [reportModalTemplate, setReportModalTemplate] = useState<{ id: string; title: string } | null>(null);
  const [reportReason, setReportReason] = useState("Inappropriate Content");
  const [reportNotes, setReportNotes] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  const categoryPills = ["All", ...PREDEFINED_CATEGORIES.map((c) => c.name)];

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/v1/templates?limit=30");
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (Array.isArray(data) && data.length > 0) {
          setTemplates(data);
        } else {
          setTemplates([]);
        }
      }
    } catch (err) {
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Upvote / Downvote Handler with auth deep-linking
  const handleVote = async (tplId: string, voteType: "upvote" | "downvote") => {
    try {
      const res = await fetch(`/api/v1/templates/${tplId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ voteType }),
      });

      if (res.status === 401) {
        // Redirect non-logged in users to login with deep link back to /templates
        router.push(`/login?callbackUrl=${encodeURIComponent("/templates")}`);
        return;
      }

      if (res.ok) {
        const json = await res.json();
        const currentVote = votedMap[tplId];

        setVotedMap((prev) => ({
          ...prev,
          [tplId]: currentVote === voteType ? null : voteType,
        }));

        setTemplates((prev) =>
          prev.map((tpl) => {
            if (tpl.id !== tplId) return tpl;
            const currentScore = tpl.upvotes_count || 0;
            let delta = 0;

            if (currentVote === voteType) {
              delta = voteType === "upvote" ? -1 : 1;
            } else if (currentVote) {
              delta = voteType === "upvote" ? 2 : -2;
            } else {
              delta = voteType === "upvote" ? 1 : -1;
            }

            return { ...tpl, upvotes_count: Math.max(0, currentScore + delta) };
          })
        );
      }
    } catch (err) {
      // Fail silently or handle error
    }
  };

  // Download Handler (Increments DB count and triggers image download)
  const handleDownload = async (tpl: TemplateItem) => {
    if (!tpl.cloudinary_secure_url) return;

    // Trigger API to increment downloads in DB
    fetch(`/api/v1/templates/${tpl.id}/download`, { method: "POST" }).catch(() => null);

    // Optimistically update count
    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, downloads_count: (t.downloads_count || 0) + 1 } : t))
    );

    // Force browser file download
    try {
      const imgRes = await fetch(tpl.cloudinary_secure_url);
      const blob = await imgRes.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${tpl.slug || "virlio-meme-template"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      window.open(tpl.cloudinary_secure_url, "_blank");
    }
  };

  // Report Modal Handlers
  const handleOpenReportModal = (id: string, title: string) => {
    setReportModalTemplate({ id, title });
    setReportReason("Inappropriate Content");
    setReportNotes("");
    setReportError(null);
    setReportSuccess(false);
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportModalTemplate) return;

    setIsReporting(true);
    setReportError(null);

    try {
      const res = await fetch(`/api/v1/templates/${reportModalTemplate.id}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reportReason, explanation: reportNotes }),
      });

      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent("/templates")}`);
        return;
      }

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Failed to submit report");
      }

      setReportSuccess(true);
      setTimeout(() => setReportModalTemplate(null), 1500);
    } catch (err: any) {
      setReportError(err.message || "Failed to submit report.");
    } finally {
      setIsReporting(false);
    }
  };

  const filteredTemplates = templates.filter((tpl) => {
    const matchesCategory = selectedCategory === "All" || tpl.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery === "" ||
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Title Banner */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
              Community Meme Templates
            </h1>
            <p className="mt-4 text-base sm:text-lg text-gray-600">
              Browse and discover verified meme formats across predefined business sectors.
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="virlio-surface p-4 sm:p-6 mb-10 border border-gray-200">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search templates, tags, categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-600 transition-colors"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                <Filter className="w-4 h-4 text-gray-400 shrink-0 mr-1" />
                {categoryPills.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg shrink-0 transition-colors ${
                      selectedCategory === cat
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Loading Skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl animate-pulse space-y-4"
                >
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-40 bg-gray-100 rounded-xl w-full" />
                </div>
              ))}
            </div>
          ) : filteredTemplates.length === 0 ? (
            /* Clean Empty State when 0 templates exist */
            <div className="py-12 virlio-surface border border-gray-200 rounded-3xl my-8">
              <ErrorPageLayout
                imageSrc="/images/errors/nothing_here_yet.png"
                imageAlt="No Templates Found Illustration"
                title="No Templates Uploaded Yet"
                description={
                  searchQuery
                    ? `No meme templates match your search "${searchQuery}".`
                    : `There are currently no community templates uploaded in the system.`
                }
                statusBadgeText="0 Templates Available"
                primaryButtonText="Upload First Template"
                primaryButtonHref="/dashboard/templates/upload"
                secondaryButtonText="Generate Meme"
                secondaryButtonHref="/dashboard/generator"
                primaryButtonIconName="explore"
                secondaryButtonIconName="home"
              />
            </div>
          ) : (
            /* Dynamic Templates Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredTemplates.map((tpl) => {
                const userVote = votedMap[tpl.id];
                const detailUrl = `/templates/${tpl.slug || tpl.id}`;

                return (
                  <div
                    key={tpl.id}
                    className="virlio-card p-5 flex flex-col justify-between bg-white border border-gray-200 hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                          {tpl.category}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {tpl.is_approved !== false && (
                            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>AI Approved</span>
                            </div>
                          )}

                          {/* Info Button to Detail Page */}
                          <Link
                            href={detailUrl}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Template Details & Info"
                          >
                            <Info className="w-4 h-4" />
                          </Link>

                          {/* Flag / Report Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenReportModal(tpl.id, tpl.title)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Report Template"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Image Preview Container */}
                      <Link href={detailUrl} className="block aspect-video bg-slate-100 rounded-xl overflow-hidden mb-3 border border-slate-200 p-2 flex items-center justify-center group">
                        {tpl.cloudinary_secure_url ? (
                          <img
                            src={tpl.cloudinary_secure_url}
                            alt={tpl.title}
                            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400 gap-1">
                            <ImageIcon className="w-8 h-8 text-slate-300" />
                            <span className="text-xs">No Image Preview</span>
                          </div>
                        )}
                      </Link>

                      <h2 className="text-base font-bold text-gray-900 mb-2 line-clamp-1">
                        <Link href={detailUrl} className="hover:text-blue-600 transition-colors">
                          {tpl.title}
                        </Link>
                      </h2>

                      <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                        <p className="flex items-center gap-1.5">
                          <span className="font-semibold text-gray-700">Contributor:</span>{" "}
                          <Link href={`/profiles/${tpl.contributor_username || "creator"}`} className="text-blue-600 hover:underline font-semibold">
                            @{tpl.contributor_username || "creator"}
                          </Link>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-gray-400" />
                          <span>{tpl.country || "Global"} • {tpl.language || "any"}</span>
                        </p>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      {/* Upvote & Downvote Buttons */}
                      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => handleVote(tpl.id, "upvote")}
                          className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${
                            userVote === "upvote"
                              ? "bg-blue-600 text-white"
                              : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                          }`}
                          title="Upvote"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span>{tpl.upvotes_count || 0}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleVote(tpl.id, "downvote")}
                          className={`p-1.5 rounded-lg transition-colors ${
                            userVote === "downvote"
                              ? "bg-rose-600 text-white"
                              : "text-slate-500 hover:text-slate-900 hover:bg-slate-200"
                          }`}
                          title="Downvote"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Download Button */}
                      <button
                        type="button"
                        onClick={() => handleDownload(tpl)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                        title="Download Template Image"
                      >
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>{tpl.downloads_count || 0}</span>
                      </button>

                      {/* Use Template Link */}
                      <Link
                        href={`/dashboard/generator?template=${tpl.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>Use</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Report Template Modal */}
      {reportModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-red-600 font-bold text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>Report Template</span>
              </div>
              <button
                type="button"
                onClick={() => setReportModalTemplate(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="text-center py-4 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-gray-900">Report Submitted</p>
                <p className="text-xs text-gray-600">Report saved to system database for moderation review.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-gray-600">
                  Reporting: <strong className="text-gray-900">{reportModalTemplate.title}</strong>
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
                    placeholder="Provide additional context for moderation team..."
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReportModalTemplate(null)}
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
