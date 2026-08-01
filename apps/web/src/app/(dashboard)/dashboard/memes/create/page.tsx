"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "@/components/ui/toast";
import {
  Sparkles,
  Building2,
  CheckCircle2,
  AlertCircle,
  Plus,
  Layers,
  ArrowRight,
  Loader2,
  Clock,
  ShieldCheck,
} from "lucide-react";

interface BrandItem {
  id: string;
  name: string;
  verification_status?: string;
  logo_url?: string;
}

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  cloudinary_secure_url?: string;
}

function CreateMemeContent() {
  const { data: session, status } = useSession();
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (status !== "authenticated") return;
      try {
        setLoading(true);
        const [brandsRes, tplRes] = await Promise.all([
          fetch("/api/v1/brands"),
          fetch("/api/v1/templates?limit=50"),
        ]);

        if (brandsRes.ok) {
          const bJson = await brandsRes.json();
          const brandList = bJson.data || [];
          setBrands(brandList);

          // Default to first verified brand if available
          const verified = brandList.find((b: BrandItem) => b.verification_status?.toLowerCase() === "verified");
          if (verified) {
            setSelectedBrandId(verified.id);
          } else if (brandList.length > 0) {
            setSelectedBrandId(brandList[0].id);
          }
        }

        if (tplRes.ok) {
          const tJson = await tplRes.json();
          const tplList = tJson.data || [];
          setTemplates(tplList);
          if (tplList.length > 0) {
            setSelectedTemplateId(tplList[0].id);
          }
        }
      } catch (err) {
        toast.error("Failed to load brand data", "Error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [status]);

  if (loading || status === "loading") {
    return (
      <div className="py-16 text-center text-xs text-gray-500 flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
        <span>Verifying brand permissions...</span>
      </div>
    );
  }

  // 1. STATE A: User has NO Brand
  if (brands.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="virlio-card p-8 sm:p-10 bg-white border border-gray-200 rounded-3xl text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
            <Building2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-100 uppercase tracking-wider">
              Brand Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Create Memes With a Verified Brand
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
              Meme creation is exclusively available to verified brands on Virlio. Create your brand workspace to unlock meme creation.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href="/dashboard/brands/new"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Brand Workspace</span>
            </Link>

            <Link
              href="/dashboard/templates"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors"
            >
              <Layers className="w-4 h-4" />
              <span>Create Templates Instead</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];
  const isVerified = selectedBrand?.verification_status?.toLowerCase() === "verified";

  // 2. STATE B: Selected Brand is NOT Verified
  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="virlio-card p-8 sm:p-10 bg-white border border-gray-200 rounded-3xl text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600">
            <Clock className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 uppercase tracking-wider">
              Verification Pending
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-3 tracking-tight">
              Brand Awaiting Verification
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 max-w-md mx-auto leading-relaxed">
              Your brand <strong className="text-gray-900">"{selectedBrand.name}"</strong> is currently pending verification. Meme creation will unlock as soon as your brand is verified by Virlio.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={`/dashboard/brands/${selectedBrand.id}`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white shadow-xs transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>View Brand Verification Status</span>
            </Link>

            <Link
              href="/dashboard/templates"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs transition-colors"
            >
              <span>Manage Templates</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. STATE C: Verified Brand Unlocks Meme Creator Editor
  const handleCreateMeme = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch("/api/v1/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: selectedBrand.id,
          template_id: selectedTemplateId || undefined,
          prompt,
          generated_caption: caption,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success("Meme created successfully for brand!", "Success");
      } else {
        toast.error(json.error || json.message || "Failed to create meme", "Creation Error");
      }
    } catch (err) {
      toast.error("Error connecting to server", "Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const verifiedBrands = brands.filter((b) => b.verification_status?.toLowerCase() === "verified");

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <div className="pb-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Brand Creation</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Create Meme for Brand
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Select your verified brand workspace and format to generate high-performing social memes.
          </p>
        </div>

        <Link
          href="/dashboard/templates/upload"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 transition-colors shrink-0"
        >
          <Layers className="w-4 h-4 text-blue-600" />
          <span>Upload Template</span>
        </Link>
      </div>

      {/* Editor Main Card */}
      <div className="virlio-card p-6 sm:p-8 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-6 max-w-4xl">
        <form onSubmit={handleCreateMeme} className="space-y-6">
          {/* Brand Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              Verified Brand Workspace
            </label>
            <select
              value={selectedBrandId}
              onChange={(e) => setSelectedBrandId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
            >
              {verifiedBrands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} (Verified)
                </option>
              ))}
            </select>
          </div>

          {/* Template Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              Select Template Format
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
            >
              {templates.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          {/* Prompt / Topic */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              Meme Concept / Topic Prompt
            </label>
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. When a developer pushes to production on Friday without unit tests..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Caption */}
          <div>
            <label className="block text-xs font-bold text-gray-900 mb-2">
              Custom Overlay Caption
            </label>
            <textarea
              rows={3}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add text overlays or custom captions for your brand..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-semibold text-white transition-colors shadow-xs disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Generate Meme for {selectedBrand.name}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateMemePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      }
    >
      <CreateMemeContent />
    </Suspense>
  );
}
