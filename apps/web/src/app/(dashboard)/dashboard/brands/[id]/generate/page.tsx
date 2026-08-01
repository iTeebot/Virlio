"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/brand-context";
import { toast } from "@/components/ui/toast";
import {
  Sparkles,
  Layers,
  Clock,
  ShieldCheck,
  Building2,
  Loader2,
  Copy,
  Check,
  Send,
  Wand2,
  Bot,
  Image as ImageIcon,
  ArrowUpRight,
  Share2,
} from "lucide-react";

interface TemplateItem {
  id: string;
  title: string;
  category: string;
  cloudinary_secure_url?: string;
}

interface GeneratedMeme {
  id?: string;
  imageUrl?: string;
  caption?: string;
  hashtags?: string[];
  created_at?: string;
}

export default function BrandMemeStudioPage() {
  const { currentBrand } = useBrand();

  const [activeTab, setActiveTab] = useState<"studio" | "templates" | "history">("studio");
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [recentMemes, setRecentMemes] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<GeneratedMeme | null>(null);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  useEffect(() => {
    async function loadData() {
      if (!currentBrand?.id) return;
      try {
        setLoading(true);
        const [tplRes, memesRes] = await Promise.all([
          fetch("/api/v1/templates?limit=50"),
          fetch(`/api/v1/memes?brandId=${currentBrand.id}`),
        ]);

        if (tplRes.ok) {
          const tJson = await tplRes.json();
          const list = tJson.data || [];
          setTemplates(list);
          if (list.length > 0) setSelectedTemplateId(list[0].id);
        }

        if (memesRes.ok) {
          const mJson = await memesRes.json();
          setRecentMemes(mJson.data || []);
        }
      } catch (err) {
        toast.error("Failed to load studio assets", "Error");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [currentBrand?.id]);

  if (!currentBrand) return null;

  const isVerified = (currentBrand.verification_status || "").toLowerCase() === "verified";
  const brandVoice = (currentBrand as any)?.knowledge_base?.ai_tone_voice || (currentBrand as any)?.brand_voice || "Professional & Creative";

  const handleGenerateMeme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error("Please enter a meme concept or topic prompt.", "Input Required");
      return;
    }

    setIsGenerating(true);
    setGeneratedResult(null);

    try {
      const selectedTpl = templates.find((t) => t.id === selectedTemplateId);
      const res = await fetch("/api/v1/memes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: currentBrand.id,
          template_id: selectedTemplateId || undefined,
          prompt: prompt.trim(),
          generated_caption: caption.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        const mockHashtags = [`#${currentBrand.slug}`, "#Virals", "#TechHumor", "#VirlioAI"];
        const result: GeneratedMeme = {
          id: json.data?.id || `meme-${Date.now()}`,
          imageUrl: selectedTpl?.cloudinary_secure_url || json.data?.image_url || "/images/placeholders/meme-preview.png",
          caption: caption.trim() || prompt.trim(),
          hashtags: mockHashtags,
          created_at: new Date().toISOString(),
        };
        setGeneratedResult(result);
        setHashtags(mockHashtags);
        toast.success(`Meme rendered successfully for ${currentBrand.name}!`, "Meme Studio");

        // Refresh recent memes list
        setRecentMemes((prev) => [json.data || result, ...prev]);
      } else {
        toast.error(json.error || json.message || "Failed to render meme", "Generation Error");
      }
    } catch (err) {
      toast.error("Network error rendering meme.", "Server Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyHashtags = () => {
    if (hashtags.length === 0) return;
    navigator.clipboard.writeText(hashtags.join(" "));
    setCopiedHashtags(true);
    toast.success("Hashtags copied to clipboard!", "Copied");
    setTimeout(() => setCopiedHashtags(false), 2000);
  };

  // State A: Brand Awaiting Verification
  if (!isVerified) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-6 font-sans">
        <div className="pb-6 border-b border-gray-200">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 uppercase tracking-wider">
              Verification Required
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-amber-500" />
            Meme Studio
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Create AI-powered branded memes using your verified brand identity, knowledge base, templates, and brand voice.
          </p>
        </div>

        <div className="p-8 sm:p-12 bg-white border border-gray-200 rounded-3xl text-center space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-100 flex items-center justify-center mx-auto text-amber-600">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              Brand Verification Pending
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto leading-relaxed">
              Meme Studio is exclusively available for verified brands. Your brand <strong className="text-gray-900">"{currentBrand.name}"</strong> is currently awaiting verification.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row justify-center gap-3">
            <Link
              href={`/dashboard/brands/${currentBrand.id}/verification`}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Complete Brand Verification</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Page Header */}
      <div className="pb-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100 flex items-center gap-1 uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentBrand.name} Studio</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Sparkles className="w-7 h-7 text-blue-600" />
            Meme Studio
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Create AI-powered branded memes using your verified brand identity, knowledge base, templates, and brand voice.
          </p>
        </div>

        {/* Future-Ready Studio Workspace Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "studio" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Studio Generator
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "templates" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Templates ({templates.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === "history" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            History ({recentMemes.length})
          </button>
        </div>
      </div>

      {/* TAB 1: STUDIO GENERATOR */}
      {activeTab === "studio" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Controls Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-blue-600" />
                  Meme Studio Generator
                </h2>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-200">
                  Voice: {brandVoice}
                </span>
              </div>

              <form onSubmit={handleGenerateMeme} className="space-y-5">
                {/* Template Format Selector */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2">
                    Template Format
                  </label>
                  {loading ? (
                    <div className="h-10 bg-gray-100 animate-pulse rounded-xl" />
                  ) : (
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-semibold text-gray-900 focus:outline-none focus:border-blue-600"
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title} ({t.category})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Concept Prompt */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2">
                    Meme Concept / Topic Prompt *
                  </label>
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={`e.g. When ${currentBrand.name} users experience instant automated workflows...`}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Overlay Caption */}
                <div>
                  <label className="block text-xs font-bold text-gray-900 mb-2">
                    Custom Overlay Caption (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Enter custom text overlays or punchlines for the meme..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Brand AI Guidelines Info */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl flex items-center justify-between text-xs text-blue-900">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Using <strong>{currentBrand.name}</strong> AI knowledge base & brand rules.</span>
                  </div>
                  <Link
                    href={`/dashboard/brands/${currentBrand.id}/brand-ai`}
                    className="font-bold text-blue-700 hover:underline text-[11px] shrink-0"
                  >
                    Edit AI Rules
                  </Link>
                </div>

                {/* Render Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-colors shadow-xs disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Rendering Branded Meme...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Render Meme for {currentBrand.name}</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Live Preview Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-3 border-b border-gray-100">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                Live Studio Output
              </h3>

              {generatedResult ? (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-2xs">
                    {generatedResult.imageUrl ? (
                      <img
                        src={generatedResult.imageUrl}
                        alt="Rendered Meme"
                        className="w-full h-full object-contain bg-slate-900"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                        Meme Output Rendered
                      </div>
                    )}
                  </div>

                  {generatedResult.caption && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 font-medium">
                      "{generatedResult.caption}"
                    </div>
                  )}

                  {hashtags.length > 0 && (
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                        <span>Suggested Hashtags</span>
                        <button
                          type="button"
                          onClick={handleCopyHashtags}
                          className="text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedHashtags ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedHashtags ? "Copied" : "Copy"}</span>
                        </button>
                      </div>
                      <p className="text-xs font-mono font-semibold text-blue-600">
                        {hashtags.join(" ")}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">Ready to Render</p>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    Enter your topic prompt above and click "Render Meme" to generate branded social content.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TEMPLATES GALLERY */}
      {activeTab === "templates" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-600" />
              Available Meme Templates
            </h2>
            <Link
              href="/dashboard/templates/upload"
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Upload New Template <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((tpl) => (
              <div key={tpl.id} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold text-gray-900 truncate">{tpl.title}</h3>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100 uppercase">
                  {tpl.category}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplateId(tpl.id);
                    setActiveTab("studio");
                    toast.info(`Selected template "${tpl.title}" in studio.`, "Template Loaded");
                  }}
                  className="w-full py-2 rounded-xl bg-white border border-gray-200 hover:bg-blue-50 hover:text-blue-700 text-xs font-bold text-gray-700 transition-colors"
                >
                  Use Template in Studio
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: GENERATION HISTORY */}
      {activeTab === "history" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" />
              Recent Rendered Memes
            </h2>
            <span className="text-xs text-gray-500 font-mono">{recentMemes.length} Saved Items</span>
          </div>

          {recentMemes.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-medium">
              No memes rendered yet for {currentBrand.name}. Use the Studio Generator to render your first meme!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentMemes.map((m, idx) => (
                <div key={m.id || idx} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <span className="text-xs font-bold text-gray-900 truncate block">
                    {m.caption_text || m.title || `Rendered Meme #${idx + 1}`}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono block">
                    {new Date(m.created_at || Date.now()).toLocaleDateString()}
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
