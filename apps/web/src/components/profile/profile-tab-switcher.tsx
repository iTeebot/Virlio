"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, Layers, Building2, ThumbsUp, ExternalLink } from "lucide-react";

export type ProfileTabType = "Memes" | "Templates" | "Brands" | "Activity";

export interface ProfileTabSwitcherProps {
  memes: any[];
  templates: any[];
  brands: any[];
  activityTimeline: any[];
}

export function ProfileTabSwitcher({
  memes,
  templates,
  brands,
  activityTimeline,
}: ProfileTabSwitcherProps) {
  const [activeTab, setActiveTab] = useState<ProfileTabType>("Memes");

  const tabs: { id: ProfileTabType; label: string; count: number }[] = [
    { id: "Memes", label: "Public Memes", count: memes.length },
    { id: "Templates", label: "Templates", count: templates.length },
    { id: "Brands", label: "Managed Brands", count: brands.length },
    { id: "Activity", label: "Timeline", count: activityTimeline.length },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-px">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={`px-4 py-2.5 text-xs font-bold transition-all border-b-2 whitespace-nowrap flex items-center gap-2 ${
              activeTab === t.id
                ? "border-blue-600 text-blue-600 bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-t-xl"
            }`}
          >
            <span>{t.label}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                activeTab === t.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content Display */}
      {activeTab === "Memes" && (
        <div className="space-y-4">
          {memes.length === 0 ? (
            <div className="virlio-card p-8 bg-white border border-gray-200 rounded-3xl text-center text-xs text-gray-500 font-medium">
              No public memes generated yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memes.map((m: any) => (
                <div key={m.id || m.title} className="virlio-card p-4 bg-white border border-gray-200 rounded-3xl space-y-3">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    {(m.cloudinary_secure_url || m.image_url) ? (
                      <Image src={m.cloudinary_secure_url || m.image_url} alt={m.title || "Meme"} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">Meme Image</div>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 truncate">{m.title || m.top_text || "Generated Meme"}</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-bold">Meme</span>
                    <span className="flex items-center gap-1 font-bold text-gray-700">
                      <ThumbsUp className="w-3 h-3 text-blue-600" />
                      <span>{m.upvotes_count || m.engagement_score || 0}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Templates" && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="virlio-card p-8 bg-white border border-gray-200 rounded-3xl text-center text-xs text-gray-500 font-medium">
              No templates uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((t: any) => (
                <div key={t.id || t.title} className="virlio-card p-4 bg-white border border-gray-200 rounded-3xl space-y-3">
                  <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
                    {(t.cloudinary_secure_url || t.image_url) ? (
                      <Image src={t.cloudinary_secure_url || t.image_url} alt={t.title || "Template"} fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">Template Image</div>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 truncate">{t.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 font-bold">{t.category || "General"}</span>
                    <Link href={`/templates/${t.slug || t.id}`} className="text-blue-600 font-bold hover:underline flex items-center gap-1">
                      <span>Use</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Brands" && (
        <div className="space-y-4">
          {brands.length === 0 ? (
            <div className="virlio-card p-8 bg-white border border-gray-200 rounded-3xl text-center text-xs text-gray-500 font-medium">
              No brands managed yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {brands.map((b: any) => (
                <div key={b.id} className="virlio-card p-5 bg-white border border-gray-200 rounded-3xl space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center overflow-hidden shrink-0">
                      {b.logo_url ? <Image src={b.logo_url} alt={b.name} fill className="object-cover" /> : <Building2 className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 truncate">{b.name}</h4>
                      <p className="text-xs text-gray-500">{b.industry || "Workspace"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "Activity" && (
        <div className="virlio-card p-6 bg-white border border-gray-200 rounded-3xl space-y-4">
          {activityTimeline.length === 0 ? (
            <div className="text-center text-xs text-gray-500 font-medium py-4">No recent activity recorded.</div>
          ) : (
            <div className="space-y-3">
              {activityTimeline.map((item: any) => (
                <div key={item.id} className="flex items-center gap-3 text-xs py-2 border-b border-gray-100 last:border-0">
                  <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                  <span className="font-semibold text-gray-900">{item.label || item.type}</span>
                  <span className="text-gray-400 ml-auto text-[11px]">
                    {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Recently"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
