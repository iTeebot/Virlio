"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Upload,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Copy,
  Layers,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Tag,
  Eye,
  Image as ImageIcon,
} from "lucide-react";

interface TemplateItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  subcategory: string;
  cloudinary_secure_url: string;
  moderation_status: "approved" | "rejected" | "flagged" | "pending";
  processing_status: string;
  duplicate_status?: string;
  duplicate_of_template_id?: string;
  duplicate_of_slug?: string;
  quality_score: number;
  risk_score: number;
  duplicate_score: number;
  public_score: number;
  created_at: string;
  ai_summary?: string;
  ocr_text?: string;
  rejection_reason?: string;
}

export default function DashboardTemplatesPage() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/templates?mine=true");
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setTemplates(json.data || []);
        }
      }
    } catch (err) {
      console.error("Failed to fetch templates:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  const filteredTemplates = templates.filter((tpl) => {
    const matchesSearch =
      tpl.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.subcategory?.toLowerCase().includes(searchQuery.toLowerCase());

    const tplIsDuplicate =
      tpl.processing_status === "DUPLICATE" ||
      tpl.duplicate_status === "exact_duplicate" ||
      tpl.duplicate_status === "visual_duplicate" ||
      Boolean(tpl.duplicate_of_template_id);

    const tplIsApproved = tpl.moderation_status === "approved" && !tplIsDuplicate;
    const tplIsReview =
      (tpl.moderation_status === "flagged" || tpl.processing_status === "NEEDS_REVIEW") && !tplIsDuplicate;
    const tplIsRejected =
      (tpl.moderation_status === "rejected" || tpl.processing_status === "REJECTED") && !tplIsDuplicate;

    if (statusFilter === "all") return matchesSearch;
    if (statusFilter === "approved") return matchesSearch && tplIsApproved;
    if (statusFilter === "review") return matchesSearch && tplIsReview;
    if (statusFilter === "rejected") return matchesSearch && tplIsRejected;
    if (statusFilter === "duplicate") return matchesSearch && tplIsDuplicate;
    return matchesSearch;
  });

  const totalCount = templates.length;
  const approvedCount = templates.filter(
    (t) => t.moderation_status === "approved" && t.processing_status !== "DUPLICATE" && !t.duplicate_of_template_id
  ).length;
  const reviewCount = templates.filter(
    (t) =>
      (t.moderation_status === "flagged" || t.processing_status === "NEEDS_REVIEW") &&
      t.processing_status !== "DUPLICATE" &&
      !t.duplicate_of_template_id
  ).length;
  const rejectedCount = templates.filter(
    (t) =>
      t.moderation_status === "rejected" ||
      t.processing_status === "REJECTED" ||
      t.processing_status === "DUPLICATE" ||
      Boolean(t.duplicate_of_template_id)
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 md:p-10 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Layers className="w-8 h-8 text-blue-600" />
            Meme Templates
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Upload, inspect AI moderation status, taxonomy, and manage your contributed meme templates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchTemplates}
            className="px-3.5 py-2 text-sm font-medium bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-100 flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <Link
            href="/dashboard/templates/upload"
            className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Upload New Template
          </Link>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-600 text-sm font-medium">
            <span>Total Submissions</span>
            <Layers className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-3xl font-bold text-slate-900 mt-2">{totalCount}</p>
          <p className="text-xs text-slate-500 mt-1">Lifetime template uploads</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 text-sm font-medium">
            <span>Approved & Public</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-3xl font-bold text-emerald-600 mt-2">{approvedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Active for community use</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 text-sm font-medium">
            <span>Needs Review</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-3xl font-bold text-amber-600 mt-2">{reviewCount}</p>
          <p className="text-xs text-slate-500 mt-1">Pending human verification</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 text-sm font-medium">
            <span>Rejected / Duplicate</span>
            <XCircle className="w-5 h-5 text-rose-600" />
          </div>
          <p className="text-3xl font-bold text-rose-600 mt-2">{rejectedCount}</p>
          <p className="text-xs text-slate-500 mt-1">Declined or flagged submissions</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, category, or subcategory..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {[
            { id: "all", label: "All Templates" },
            { id: "approved", label: "Approved" },
            { id: "review", label: "Needs Review" },
            { id: "rejected", label: "Rejected" },
            { id: "duplicate", label: "Duplicates" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition whitespace-nowrap ${
                statusFilter === tab.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid Display */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 space-y-3">
          <RefreshCw className="w-8 h-8 mx-auto animate-spin text-blue-600" />
          <p className="text-sm font-medium">Loading your template collection...</p>
        </div>
      ) : filteredTemplates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-600 space-y-4 shadow-sm">
          <div className="relative w-40 h-40 mx-auto">
            <Image
              src={searchQuery ? "/images/empty_state/no_search_results.png" : "/images/empty_state/no_templates.png"}
              alt="No Templates Illustration"
              fill
              className="object-contain"
            />
          </div>
          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-bold text-slate-900">No templates found</h3>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery || statusFilter !== "all"
                ? "No uploaded templates match your current filters. Try adjusting your search query."
                : "You haven't uploaded any meme templates yet. Get started by uploading your first template!"}
            </p>
          </div>
          <Link
            href="/dashboard/templates/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium text-sm rounded-lg hover:bg-blue-700 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Upload Meme Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => {
            const isDuplicate =
              template.processing_status === "DUPLICATE" ||
              template.duplicate_status === "exact_duplicate" ||
              template.duplicate_status === "visual_duplicate" ||
              Boolean(template.duplicate_of_template_id);

            const isApproved = template.moderation_status === "approved" && !isDuplicate;
            const isRejected = (template.moderation_status === "rejected" || template.processing_status === "REJECTED") && !isDuplicate;
            const isReview = (template.moderation_status === "flagged" || template.processing_status === "NEEDS_REVIEW") && !isDuplicate;

            return (
              <div
                key={template.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Template Image Preview */}
                  <div className="relative aspect-video bg-slate-100 overflow-hidden border-b border-slate-200 flex items-center justify-center">
                    {template.cloudinary_secure_url ? (
                      <img
                        src={template.cloudinary_secure_url}
                        alt={template.title}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4">
                        <ImageIcon className="w-8 h-8 text-slate-300" />
                        <span className="text-xs font-medium text-slate-500">Duplicate Submission</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Approved
                        </span>
                      )}
                      {isReview && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Needs Review
                        </span>
                      )}
                      {isDuplicate && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-300">
                          <Copy className="w-3.5 h-3.5 text-purple-600" />
                          Duplicate
                        </span>
                      )}
                      {isRejected && !isDuplicate && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Rejected
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <h3 className="font-bold text-slate-900 text-lg line-clamp-1">{template.title}</h3>

                    {/* Categories & Taxonomy */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Tag className="w-3 h-3" />
                        {template.category}
                      </span>
                      {template.subcategory && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {template.subcategory}
                        </span>
                      )}
                    </div>

                    {/* AI Score pill */}
                    <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                        Quality: {template.quality_score}/100
                      </span>
                      <span>{new Date(template.created_at).toLocaleDateString()}</span>
                    </div>

                    {isRejected && template.rejection_reason && (
                      <p className="text-xs text-rose-600 bg-rose-50 p-2.5 rounded border border-rose-200 mt-2">
                        Reason: {template.rejection_reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-mono">
                    Score: {template.public_score || 0}
                  </span>

                  {isApproved ? (
                    <Link
                      href={`/templates/${template.slug}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      View Public Page
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : isDuplicate ? (
                    <Link
                      href={`/templates/${template.duplicate_of_slug || template.slug}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-300 transition"
                    >
                      <Copy className="w-3.5 h-3.5 text-purple-600" />
                      <span>See Duplicate</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Private
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
