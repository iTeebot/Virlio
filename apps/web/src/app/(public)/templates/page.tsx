"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
} from "lucide-react";

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  subcategory?: string;
  country?: string;
  language?: string;
  tags?: string[];
  upvotes_count?: number;
  downloads_count?: number;
  contributor_username?: string;
  is_approved?: boolean;
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportModalTemplate, setReportModalTemplate] = useState<{ id: string; title: string } | null>(null);
  const [reportReason, setReportReason] = useState("Inappropriate Content");
  const [reportNotes, setReportNotes] = useState("");
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const categoryPills = ["All", ...PREDEFINED_CATEGORIES.map((c) => c.name)];

  useEffect(() => {
    async function fetchTemplates() {
      try {
        setLoading(true);
        const res = await fetch("/api/v1/templates?limit=20");
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
    }

    fetchTemplates();
  }, []);

  const handleOpenReportModal = (id: string, title: string) => {
    setReportModalTemplate({ id, title });
    setReportReason("Inappropriate Content");
    setReportNotes("");
    setReportSuccess(false);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReporting(true);
    setTimeout(() => {
      setIsReporting(false);
      setReportSuccess(true);
      setTimeout(() => setReportModalTemplate(null), 1500);
    }, 1000);
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
                  <div className="h-20 bg-gray-100 rounded w-full" />
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
              {filteredTemplates.map((tpl) => (
                <div key={tpl.id} className="virlio-card p-6 flex flex-col justify-between bg-white border border-gray-200">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {tpl.category}
                      </span>
                      <div className="flex items-center gap-2">
                        {tpl.is_approved && (
                          <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>AI Approved</span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenReportModal(tpl.id, tpl.title)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Report Template"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-base font-bold text-gray-900 mb-2">{tpl.title}</h2>

                    <div className="space-y-1.5 text-xs text-gray-600 mb-4">
                      <p className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700">Contributor:</span>{" "}
                        <Link href={`/profiles/${tpl.contributor_username || "creator"}`} className="text-blue-600 hover:underline font-semibold">
                          @{tpl.contributor_username || "creator"}
                        </Link>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-gray-400" />
                        <span>{tpl.country || "Global"} • {tpl.language || "English"}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500">
                        <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                        {tpl.upvotes_count || 0}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-semibold text-gray-500 ml-2">
                        <Download className="w-3.5 h-3.5 text-gray-400" />
                        {tpl.downloads_count || 0}
                      </span>
                    </div>

                    <Link
                      href={`/dashboard/generator?template=${tpl.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <span>Use Template</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
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
                <p className="text-xs text-gray-600">Our moderation team will inspect this template format.</p>
              </div>
            ) : (
              <form onSubmit={handleReportSubmit} className="space-y-4">
                <p className="text-xs text-gray-600">
                  Reporting: <strong className="text-gray-900">{reportModalTemplate.title}</strong>
                </p>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Reason for Report</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs text-gray-900 focus:outline-none focus:border-blue-600"
                  >
                    <option value="Inappropriate Content">Inappropriate / Unsafe Content</option>
                    <option value="Copyright Violation">Copyright Violation</option>
                    <option value="Misleading Tags">Misleading Tags / Metadata</option>
                    <option value="Spam / Duplicate">Spam / Duplicate Upload</option>
                  </select>
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
