"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Building2, Plus, ShieldCheck, ArrowRight, Eye, Settings, RotateCcw, Trash2, Clock, Sparkles } from "lucide-react";

export default function BrandsOverviewPage() {
  const [brands, setBrands] = useState<any[]>([]);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserBrandsAndDraft = async () => {
    try {
      // Fetch published brands
      const brandsRes = await fetch("/api/v1/brands?mode=my");
      if (brandsRes.ok) {
        const json = await brandsRes.json();
        setBrands(json.data || []);
      }

      // Fetch active draft if available
      const draftRes = await fetch("/api/v1/brands/draft");
      if (draftRes.ok) {
        const draftJson = await draftRes.json();
        if (draftJson.data && draftJson.data.step_data) {
          setDraft(draftJson.data);
        } else {
          setDraft(null);
        }
      }
    } catch (err) {
      console.error("Failed to load user brands or draft", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBrandsAndDraft();
  }, []);

  const handleDiscardDraft = async () => {
    if (!confirm("Are you sure you want to discard this brand setup draft? This action cannot be undone.")) return;
    try {
      await fetch("/api/v1/brands/draft", { method: "DELETE" });
      setDraft(null);
    } catch (err) {
      console.error("Failed to discard draft", err);
    }
  };

  const STEP_TITLES = [
    "Basic Info",
    "Brand Identity",
    "Audience",
    "Products",
    "Brand Voice",
    "Social Presence",
    "Verification",
    "AI Analysis",
    "Review & Submit",
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Top Header & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100">
              Workspace Overview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-blue-600" />
            My Brand Workspaces
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Manage your brand identities, AI knowledge bases, verification confidence, and team collaboration.
          </p>
        </div>

        <Link
          href="/dashboard/brands/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Brand
        </Link>
      </div>

      {/* Active Draft Status Card */}
      {draft && draft.step_data && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold uppercase border border-amber-200">
                    Draft Status
                  </span>
                  <span className="text-xs text-gray-500 font-medium">In-Progress Setup</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 tracking-tight mt-1">
                  {draft.step_data.step1?.name || "Unnamed Brand Draft"}
                </h3>
                {draft.step_data.step1?.slug && (
                  <span className="text-xs text-blue-600 font-mono font-semibold">@{draft.step_data.step1.slug}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-xl hover:bg-red-50 transition-colors shadow-xs"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Discard
              </button>
              <Link
                href="/dashboard/brands/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Resume Setup
              </Link>
            </div>
          </div>

          {/* Progress Bar & Details */}
          <div className="pt-2 border-t border-amber-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-950 font-semibold">
              <span>Step {draft.current_step || 1} of 9: {STEP_TITLES[(draft.current_step || 1) - 1]}</span>
              <span>{Math.round(((draft.current_step || 1) / 9) * 100)}% Completed</span>
            </div>
            <div className="w-full h-2 bg-amber-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-600 rounded-full transition-all duration-300"
                style={{ width: `${((draft.current_step || 1) / 9) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-gray-500 font-medium">Loading brand workspaces...</div>
      ) : brands.length === 0 && !draft ? (
        <div className="p-12 bg-white border border-gray-200 rounded-2xl text-center space-y-4 shadow-xs">
          <Building2 className="w-12 h-12 text-gray-400 mx-auto" />
          <h3 className="text-lg font-bold text-gray-900">No Brands Created Yet</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            You don't own or belong to any brand workspace. Launch your AI-assisted onboarding wizard to set up your first brand.
          </p>
          <Link
            href="/dashboard/brands/new"
            className="inline-flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
          >
            Launch Brand Creation Wizard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {brands.length > 0 && <h2 className="text-base font-bold text-gray-900">Published Workspaces</h2>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {brands.map((b) => {
              const isVerified = (b.verification_status || "").toLowerCase() === "verified";
              const userRole = b.userRole || "owner";

              return (
                <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-gray-300 transition-colors shadow-xs">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {b.logo_url ? (
                          <img src={b.logo_url} alt={b.name} className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1 border border-gray-200" />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center font-black text-blue-600 text-lg border border-blue-100">
                            {b.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            {b.name}
                            {isVerified && (
                              <span title="Verified Brand">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              </span>
                            )}
                          </h2>
                          <span className="text-xs text-blue-600 font-mono font-semibold">@{b.slug}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 rounded-full capitalize">
                          {userRole.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                      {b.description || "No description provided."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-2 text-xs text-gray-500 border-t border-gray-100">
                      <span className="flex items-center gap-1 font-medium">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Confidence: <strong className="text-gray-900">{b.ai_confidence_score || 0}%</strong>
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        Sector: <strong className="text-gray-900">{b.industry || "General"}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between gap-2 border-t border-gray-100">
                    <Link
                      href={`/dashboard/brands/${b.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      Manage Workspace
                    </Link>

                    <div className="flex items-center gap-2">
                      <Link
                        href={`/brands/${b.slug}`}
                        target="_blank"
                        className="p-2 bg-white text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-xs"
                        title="View Public Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
