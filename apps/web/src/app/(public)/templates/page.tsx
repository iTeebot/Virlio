"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ErrorPageLayout } from "@/components/errors/ErrorPageLayout";
import { PREDEFINED_CATEGORIES } from "@/lib/constants/categories";
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  Download,
  CheckCircle2,
  Globe,
  ArrowRight,
  AlertTriangle,
  Loader2,
  Tag,
  Image as ImageIcon,
  Info,
  X,
} from "lucide-react";

import { useTemplateStore } from "@/providers/template-provider";
import { useTemplateVote } from "@/hooks/useTemplateVote";
import {
  TemplateSearchBar,
  TemplateFilterButton,
  TemplateFilterPanel,
  CategoryItem,
  TemplateFilterState,
} from "@/components/templates";

interface TemplateItem {
  id: string;
  slug?: string;
  title: string;
  description?: string;
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
  ocr_text?: string;
  approval_metadata?: {
    ocrText?: string;
    [key: string]: any;
  };
  currentUserVote?: "upvote" | "downvote" | null;
  user_vote?: "upvote" | "downvote" | null;
  user_voted?: "up" | "down" | "upvote" | "downvote" | null;
  user_has_voted?: boolean;
}

function TemplateGridCard({
  tpl,
  onOpenReportModal,
  onDownload,
}: {
  tpl: TemplateItem;
  onOpenReportModal: (id: string, title: string) => void;
  onDownload: (tpl: TemplateItem) => void;
}) {
  const {
    upvotesCount,
    isLiked,
    isDisliked,
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
        {/* Top Meta Bar */}
        <div className="flex items-center justify-between mb-3">
          <Link
            href={`/templates?category=${encodeURIComponent(tpl.category.toLowerCase().replace(/\s+/g, "-"))}`}
            className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition"
          >
            <Tag className="w-3 h-3" />
            <span>{tpl.category}</span>
          </Link>

          <div className="flex items-center gap-1.5">
            {tpl.is_approved !== false && (
              <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>AI Approved</span>
              </div>
            )}

            <Link
              href={detailUrl}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="View Template Details & Info"
            >
              <Info className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => onOpenReportModal(tpl.id, tpl.title)}
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
            disabled={isPending}
            onClick={() => handleVote("upvote")}
            className={`p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold ${isLiked
                ? "bg-blue-600 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            title="Upvote"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span>{upvotesCount}</span>
          </button>

          <button
            type="button"
            disabled={isPending}
            onClick={() => handleVote("downvote")}
            className={`p-1.5 rounded-lg transition-colors ${isDisliked
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
          onClick={() => onDownload(tpl)}
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
}

function TemplatesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Search Query state (primary element)
  const [searchQuery, setSearchQuery] = useState("");

  // Categories from DB API + predefined categories
  const [dbCategories, setDbCategories] = useState<Array<{ id?: string; slug: string; name: string; count?: number }>>([]);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Active filter state
  const [filterState, setFilterState] = useState<TemplateFilterState>(() => {
    const categorySingle = searchParams.get("category");
    const categoriesMulti = searchParams.get("categories");

    let initialCats: string[] = [];
    if (categoriesMulti) {
      initialCats = categoriesMulti.split(",").map((c) => c.trim().toLowerCase()).filter(Boolean);
    } else if (categorySingle && categorySingle.toLowerCase() !== "all") {
      initialCats = [categorySingle.trim().toLowerCase()];
    }

    return { categories: initialCats };
  });

  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Report Modal state
  const [reportModalTemplate, setReportModalTemplate] = useState<{ id: string; title: string } | null>(null);
  const [reportReason, setReportReason] = useState("Inappropriate Content");
  const [reportNotes, setReportNotes] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  // Fetch categories list from server
  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/v1/categories");
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (Array.isArray(data?.categories)) {
            setDbCategories(data.categories);
          }
        }
      } catch (err) {
        setDbCategories([]);
      }
    }
    fetchCategories();
  }, []);

  const { syncTemplates } = useTemplateStore();

  // Fetch public templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const url = `/api/v1/templates?limit=50`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        const data = json.data || json;
        if (Array.isArray(data)) {
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
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  // Consolidate predefined categories and DB categories into CategoryItem format
  const categoriesList: CategoryItem[] = useMemo(() => {
    const map = new Map<string, CategoryItem>();

    PREDEFINED_CATEGORIES.forEach((c) => {
      map.set(c.slug.toLowerCase(), {
        id: c.id,
        slug: c.slug.toLowerCase(),
        name: c.name,
        description: c.description,
      });
    });

    dbCategories.forEach((c) => {
      if (c.slug) {
        const key = c.slug.toLowerCase();
        const existing = map.get(key);
        map.set(key, {
          id: c.id || existing?.id,
          slug: key,
          name: c.name || existing?.name || c.slug,
          description: existing?.description,
          count: c.count,
        });
      }
    });

    return Array.from(map.values());
  }, [dbCategories]);

  // Handle download of template image
  const handleDownload = async (tpl: TemplateItem) => {
    if (!tpl.cloudinary_secure_url) return;

    fetch(`/api/v1/templates/${tpl.id}/download`, { method: "POST" }).catch(() => null);

    setTemplates((prev) =>
      prev.map((t) => (t.id === tpl.id ? { ...t, downloads_count: (t.downloads_count || 0) + 1 } : t))
    );

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

  // Report modal handlers
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

  // Apply new filter state and update URL query parameters
  const handleApplyFilters = (newState: TemplateFilterState) => {
    setFilterState(newState);

    if (newState.categories.length === 0) {
      router.push("/templates");
    } else if (newState.categories.length === 1) {
      router.push(`/templates?category=${encodeURIComponent(newState.categories[0])}`);
    } else {
      router.push(`/templates?categories=${encodeURIComponent(newState.categories.join(","))}`);
    }
  };

  // Filter templates based on primary search query + multi-category filter state
  const filteredTemplates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const activeCats = filterState.categories;

    return templates.filter((tpl) => {
      // 1. Category Filter Check (Multi-select support)
      if (activeCats.length > 0) {
        const tplCategorySlug = tpl.category.toLowerCase().replace(/\s+/g, "-");
        const tplCategoryNameLower = tpl.category.toLowerCase();

        const matchesCategory = activeCats.some(
          (catSlug) =>
            catSlug === tplCategorySlug ||
            catSlug === tplCategoryNameLower ||
            categoriesList.find((c) => c.slug === catSlug)?.name.toLowerCase() === tplCategoryNameLower
        );

        if (!matchesCategory) return false;
      }

      // 2. Search Query Check (Title, Description, Tags, Category, Subcategory, OCR Text, Contributor)
      if (!query) return true;

      const titleMatch = tpl.title?.toLowerCase().includes(query);
      const descMatch = tpl.description?.toLowerCase().includes(query);
      const categoryMatch = tpl.category?.toLowerCase().includes(query);
      const subcategoryMatch = tpl.subcategory?.toLowerCase().includes(query);
      const tagMatch = tpl.tags?.some((t) => t.toLowerCase().includes(query));
      const contributorMatch = tpl.contributor_username?.toLowerCase().includes(query);
      const ocrMatch =
        tpl.ocr_text?.toLowerCase().includes(query) ||
        tpl.approval_metadata?.ocrText?.toLowerCase().includes(query);

      return Boolean(
        titleMatch ||
        descMatch ||
        categoryMatch ||
        subcategoryMatch ||
        tagMatch ||
        contributorMatch ||
        ocrMatch
      );
    });
  }, [templates, searchQuery, filterState, categoriesList]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900 selection:bg-blue-600 selection:text-white virlio-landing-bg">
      <Header />

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header Title Banner */}
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-5xl tracking-tight">
              Community Meme Templates
            </h1>
            <p className="mt-3 text-sm sm:text-lg text-gray-600">
              Browse and discover verified meme formats across predefined business sectors.
            </p>
          </div>

          {/* TOP SECTION: Primary Search Bar & Dedicated Filter Button ONLY */}
          <div className="relative mb-8 sm:mb-10">
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between max-w-4xl mx-auto">
              {/* 1. Large Search Bar */}
              <TemplateSearchBar
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search templates..."
                className="flex-1"
              />

              {/* 2. Filter Button (triggers filter panel) */}
              <div className="relative w-full sm:w-auto">
                <TemplateFilterButton
                  activeCount={filterState.categories.length}
                  isOpen={isFilterPanelOpen}
                  onClick={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
                  className="w-full sm:w-auto"
                />

                {/* Dedicated Filter Panel Popover/Drawer Component */}
                <TemplateFilterPanel
                  isOpen={isFilterPanelOpen}
                  onClose={() => setIsFilterPanelOpen(false)}
                  categories={categoriesList}
                  filterState={filterState}
                  onApplyFilters={handleApplyFilters}
                />
              </div>
            </div>

            {/* Active Category Badges Bar */}
            {filterState.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2 max-w-4xl mx-auto px-1">
                <span className="text-xs text-gray-500 font-semibold">Active Categories:</span>
                {filterState.categories.map((catSlug) => {
                  const catObj = categoriesList.find((c) => c.slug === catSlug);
                  return (
                    <span
                      key={catSlug}
                      className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {catObj?.name || catSlug}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = filterState.categories.filter((c) => c !== catSlug);
                          handleApplyFilters({ ...filterState, categories: updated });
                        }}
                        className="hover:text-blue-900 transition-colors p-0.5 rounded-full hover:bg-blue-100"
                        title={`Remove ${catObj?.name || catSlug}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  onClick={() => handleApplyFilters({ ...filterState, categories: [] })}
                  className="text-xs text-gray-500 hover:text-rose-600 font-bold underline transition ml-2"
                >
                  Clear All
                </button>
              </div>
            )}
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
            /* Clean Empty State when 0 templates exist or match filter */
            <div className="py-12 virlio-surface border border-gray-200 rounded-3xl my-8">
              <ErrorPageLayout
                imageSrc={
                  searchQuery || filterState.categories.length > 0
                    ? "/images/empty_state/no_search_results.png"
                    : "/images/empty_state/no_templates.png"
                }
                imageAlt="No Templates Found Illustration"
                title={
                  searchQuery || filterState.categories.length > 0
                    ? "No Matching Templates Found"
                    : "No Templates Found"
                }
                description={
                  searchQuery || filterState.categories.length > 0
                    ? `No meme templates match your active search criteria or category filters.`
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
              {filteredTemplates.map((tpl) => (
                <TemplateGridCard
                  key={tpl.id}
                  tpl={tpl}
                  onOpenReportModal={handleOpenReportModal}
                  onDownload={handleDownload}
                />
              ))}
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

export default function TemplatesPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-600">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <TemplatesContent />
    </Suspense>
  );
}
