"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ThumbsUp, Download, CheckCircle2, Globe, ArrowRight, Layers, Sparkles } from "lucide-react";

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

export function TemplatesPreview() {
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [loading, setLoading] = useState(true);

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
            <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
              <Layers className="w-7 h-7" />
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
              <div key={tpl.id} className="virlio-card p-6 flex flex-col justify-between bg-white border border-gray-200">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      {tpl.category}
                    </span>
                    {tpl.is_approved && (
                      <div className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>AI Approved</span>
                      </div>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-gray-900 mb-2">{tpl.title}</h3>

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
                  <span className="text-gray-600 font-medium">By @{tpl.contributor_username || "creator"}</span>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                      {tpl.upvotes_count || 0}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-gray-700">
                      <Download className="w-3.5 h-3.5 text-gray-500" />
                      {tpl.downloads_count || 0}
                    </span>
                  </div>
                </div>
              </div>
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
