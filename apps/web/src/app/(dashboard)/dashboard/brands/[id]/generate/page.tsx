"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useBrand } from "@/components/dashboard/brand-context";
import { toast } from "@/components/ui/toast";
import {
  Sparkles,
  Wand2,
  Layers,
  Clock,
  ShieldCheck,
  CheckSquare,
  Square,
  RotateCw,
  Check,
  AlertCircle,
  Bookmark,
  Compass,
  Lock,
  HelpCircle,
  Loader2,
  Tv,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
} from "lucide-react";
import { validateSafetyAndProfanity } from "@/lib/validations/safety-filter";

interface GeneratedMeme {
  id: string;
  templateId: string;
  templateTitle: string;
  templateImageUrl: string | null;
  title: string | null;
  description: string | null;
  topText: string | null;
  bottomText: string | null;
  regionCaptions: Record<string, string> | null;
  textLayout: string;
  regions?: any[] | null;
  confidence: number;
  tone: string;
  reasonSelected: string;
  hashtags: string[];
  status: string;
  // If finalized
  cloudinary_secure_url?: string | null;
}

export default function BrandMemeStudioPage() {
  const { currentBrand } = useBrand();

  const [activeTab, setActiveTab] = useState<"studio" | "history">("studio");
  const [topic, setTopic] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [marketingGoal, setMarketingGoal] = useState("Awareness");
  const [tone, setTone] = useState("witty");
  const [cta, setCta] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationResult, setGenerationResult] = useState<{
    generationId: string;
    memes: GeneratedMeme[];
  } | null>(null);

  const [selectedMemeIds, setSelectedMemeIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [savingStatus, setSavingStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});
  
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);

  // Load history
  useEffect(() => {
    async function loadHistory() {
      if (!currentBrand?.id) return;
      try {
        setLoadingHistory(true);
        const res = await fetch(`/api/v1/memes?brandId=${currentBrand.id}`);
        if (res.ok) {
          const json = await res.json();
          // Filter out drafts that were never saved/accepted
          const published = (json.data || []).filter(
            (m: any) => m.status === "accepted" || m.status === "approved"
          );
          setHistory(published);
        }
      } catch (err) {
        console.error("Failed to load history:", err);
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [currentBrand?.id, activeTab]);

  if (!currentBrand) return null;

  const isVerified = (currentBrand.verification_status || "").toLowerCase() === "verified";
  const brandVoice = (currentBrand as any)?.knowledge_base?.brand_voice?.description || "Professional & Creative";

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a topic or concept prompt.", "Input Required");
      return;
    }

    // Validate all user inputs against safety/NSFW policy
    const inputsToCheck = [
      { name: "Topic", value: topic },
      { name: "Campaign Name", value: campaignName },
      { name: "Target Audience", value: targetAudience },
      { name: "Call to Action", value: cta },
      { name: "Additional Notes", value: additionalNotes },
    ];

    for (const input of inputsToCheck) {
      if (input.value.trim()) {
        const check = validateSafetyAndProfanity(input.value);
        if (!check.isValid) {
          toast.error(`${input.name} declined: ${check.reason}`, "Safety Policy Violation");
          return;
        }
      }
    }

    setIsGenerating(true);
    setGenerationResult(null);
    setSelectedMemeIds(new Set());
    setSavingStatus({});

    try {
      const res = await fetch("/api/v1/memes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: currentBrand.id,
          topic: topic.trim(),
          campaign_name: campaignName.trim() || undefined,
          target_audience: targetAudience.trim() || undefined,
          marketing_goal: marketingGoal || undefined,
          tone: tone || undefined,
          cta: cta.trim() || undefined,
          additional_notes: additionalNotes.trim() || undefined,
          count: 4,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        setGenerationResult(json.data);
        // Select all by default
        const allIds = new Set<string>(json.data.memes.map((m: GeneratedMeme) => m.id));
        setSelectedMemeIds(allIds);
        toast.success(`Successfully generated 4 branded memes!`, "AI Meme Engine");
      } else {
        toast.error(json.error || json.message || "Failed to generate memes", "Generation Error");
      }
    } catch (err) {
      toast.error("Network error calling meme engine.", "Server Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRegenerate = async (memeIdsToRegen: string[]) => {
    if (!generationResult) return;

    setIsGenerating(true);
    try {
      const res = await fetch(`/api/v1/memes/generate/${generationResult.generationId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brand_id: currentBrand.id,
          topic: topic.trim(),
          meme_ids: memeIdsToRegen,
        }),
      });

      const json = await res.json();

      if (res.ok && json.success) {
        // Replace regenerated memes in the list
        const updatedMemes = [...generationResult.memes];
        const newMemes: GeneratedMeme[] = json.data.memes;

        // Map and replace by template match or index
        memeIdsToRegen.forEach((oldId, index) => {
          const oldIndex = updatedMemes.findIndex((m) => m.id === oldId);
          if (oldIndex !== -1 && newMemes[index]) {
            updatedMemes[oldIndex] = newMemes[index];
            
            // Auto select new ones
            setSelectedMemeIds((prev) => {
              const copy = new Set(prev);
              copy.delete(oldId);
              copy.add(newMemes[index].id);
              return copy;
            });
          }
        });

        setGenerationResult({
          ...generationResult,
          memes: updatedMemes,
        });

        toast.success(`Regenerated ${memeIdsToRegen.length} meme(s)!`, "Regenerated");
      } else {
        toast.error(json.error || json.message || "Failed to regenerate", "Error");
      }
    } catch (err) {
      toast.error("Network error regenerating memes.", "Server Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveSelected = async () => {
    if (!generationResult || selectedMemeIds.size === 0) return;

    setIsSaving(true);
    let successCount = 0;

    const idsArray = Array.from(selectedMemeIds);

    // Initialize statuses to saving
    const initialStatus: Record<string, "saving" | "saved" | "error" | "idle"> = {};
    idsArray.forEach((id) => {
      initialStatus[id] = "saving";
    });
    setSavingStatus(initialStatus);

    for (const memeId of idsArray) {
      try {
        const memeToSave = generationResult.memes.find((m) => m.id === memeId);

        const res = await fetch("/api/v1/memes", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: memeId,
            status: "accepted",
            watermark_enabled: watermarkEnabled,
            title: memeToSave?.title || undefined,
            description: memeToSave?.description || undefined,
            hashtags: memeToSave?.hashtags || undefined,
          }),
        });

        const json = await res.json();
        if (res.ok && json.success) {
          setSavingStatus((prev) => ({ ...prev, [memeId]: "saved" }));
          successCount++;
          
          // Update the list image URL so we display the finalized server-side composite
          setGenerationResult((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              memes: prev.memes.map((m) => {
                if (m.id === memeId) {
                  return { ...m, status: "accepted", cloudinary_secure_url: json.data.cloudinary_secure_url };
                }
                return m;
              }),
            };
          });
        } else {
          setSavingStatus((prev) => ({ ...prev, [memeId]: "error" }));
        }
      } catch (err) {
        setSavingStatus((prev) => ({ ...prev, [memeId]: "error" }));
      }
    }

    setIsSaving(false);
    if (successCount > 0) {
      toast.success(`Successfully saved ${successCount} meme(s) as drafts!`, "Saved Drafts");
      // Add to local history list
      const savedMemes = generationResult.memes.filter((m) => selectedMemeIds.has(m.id));
      setHistory((prev) => [...savedMemes, ...prev]);
    } else {
      toast.error("Failed to save selected memes.", "Error");
    }
  };

  const toggleSelectMeme = (id: string) => {
    setSelectedMemeIds((prev) => {
      const copy = new Set(prev);
      if (copy.has(id)) {
        copy.delete(id);
      } else {
        copy.add(id);
      }
      return copy;
    });
  };

  const toggleSelectAll = () => {
    if (!generationResult) return;
    if (selectedMemeIds.size === generationResult.memes.length) {
      setSelectedMemeIds(new Set());
    } else {
      const allIds = new Set(generationResult.memes.map((m) => m.id));
      setSelectedMemeIds(allIds);
    }
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
            AI Meme Studio
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Generate, iterate, and publish customized memes aligning perfectly with your brand identity and voice.
          </p>
        </div>

        {/* Studio Workspace Tabs */}
        <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-2xl border border-gray-200 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("studio")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "studio" ? "bg-white text-blue-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Meme Studio
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "history" ? "bg-white text-blue-600 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Published & Drafts ({history.length})
          </button>
        </div>
      </div>

      {activeTab === "studio" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form Card */}
            <div className="lg:col-span-4">
              <div className="p-6 bg-white border border-gray-200 rounded-3xl shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Wand2 className="w-4 h-4 text-blue-600" />
                    Configure Meme Generator
                  </h2>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4">
                  {/* Topic (required) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5 flex items-center justify-between">
                      <span>Concept Topic / Hook *</span>
                      <span className="text-[10px] text-gray-400 font-normal">Max 500 chars</span>
                    </label>
                    <textarea
                      rows={3}
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g. Developers fighting merge conflicts on Friday afternoon"
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
                    />
                  </div>

                  {/* Campaign Name (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Campaign Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      placeholder="e.g. Q3 Product Launch"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
                    />
                  </div>

                  {/* Target Audience (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Target Audience (Optional)
                    </label>
                    <input
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      placeholder="e.g. Junior web engineers"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
                    />
                  </div>

                  {/* Grid fields */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Marketing Goal */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Marketing Goal
                      </label>
                      <select
                        value={marketingGoal}
                        onChange={(e) => setMarketingGoal(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-600"
                      >
                        <option value="Awareness">Awareness</option>
                        <option value="Engagement">Engagement</option>
                        <option value="Conversion">Conversion</option>
                        <option value="Retention">Retention</option>
                      </select>
                    </div>

                    {/* Tone */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1.5">
                        Meme Tone
                      </label>
                      <select
                        value={tone}
                        onChange={(e) => setTone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 focus:outline-none focus:border-blue-600"
                      >
                        <option value="witty">Witty</option>
                        <option value="sarcastic">Sarcastic</option>
                        <option value="wholesome">Wholesome</option>
                        <option value="professional">Professional</option>
                        <option value="absurd">Absurd</option>
                        <option value="deadpan">Deadpan</option>
                      </select>
                    </div>
                  </div>

                  {/* Call to Action (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Call to Action / Link (Optional)
                    </label>
                    <input
                      type="text"
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      placeholder="e.g. Try Virlio Free today"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
                    />
                  </div>

                  {/* Additional Notes (optional) */}
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1.5">
                      Additional Styling Notes (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="e.g. Use a popular 2026 reaction format if possible"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white text-xs font-medium text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/20"
                    />
                  </div>

                  {/* Watermark toggle (Paid feature, locked to enabled/active watermark) */}
                  <div className="pt-2 flex items-center justify-between text-xs text-gray-400 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <span>Disable Virlio Watermark</span>
                      <span className="cursor-help" title="Not included in current plan">
                        <HelpCircle className="w-3.5 h-3.5 text-gray-400" />
                      </span>
                    </span>
                    <button
                      type="button"
                      disabled
                      className="relative inline-flex h-5 w-9 shrink-0 cursor-not-allowed rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out bg-gray-200 opacity-60"
                    >
                      <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out translate-x-0" />
                    </button>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isGenerating || isSaving}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white transition-all shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>AI Selecting & Writing...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Meme Batch</span>
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Brand Profile Details Card */}
              <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-3xl space-y-2">
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                  Active Brand Rules
                </span>
                <h4 className="text-xs font-bold text-gray-900">{currentBrand.name} Profile</h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  <strong>Tone/Style:</strong> {brandVoice}
                </p>
                <div className="pt-2 flex justify-between items-center text-[10px] text-gray-400">
                  <span>Industry: {currentBrand.industry}</span>
                  <Link href={`/dashboard/brands/${currentBrand.id}/brand-ai`} className="text-blue-600 font-bold hover:underline">
                    Settings &rarr;
                  </Link>
                </div>
              </div>
            </div>

            {/* Results Column */}
            <div className="lg:col-span-8 space-y-6">
              {isGenerating && (
                <div className="py-24 bg-white border border-gray-200 rounded-3xl text-center space-y-4 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center animate-bounce">
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900">AI Meme Pipeline Active</h3>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      Ranking templates, analyzing OCR overlays, and writing contextual caption pairs based on brand parameters.
                    </p>
                  </div>
                  <div className="w-48 bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full w-2/3 animate-[loading_1.5s_infinite_ease-in-out]" />
                  </div>
                </div>
              )}

              {!isGenerating && !generationResult && (
                <div className="py-24 bg-white border border-gray-200 rounded-3xl text-center space-y-4">
                  <div className="w-12 h-12 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Tv className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-gray-900">No Active Generation</h3>
                    <p className="text-xs text-gray-500 max-w-xs mx-auto">
                      Configure your campaign theme on the left and trigger generation to render your customized 2x2 meme drafts.
                    </p>
                  </div>
                </div>
              )}

              {/* Generation Result Grid */}
              {!isGenerating && generationResult && (
                <div className="space-y-6">
                  {/* Batch actions bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-white border border-gray-200 rounded-3xl gap-4 shadow-2xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
                      >
                        {selectedMemeIds.size === generationResult.memes.length ? (
                          <>
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                            <span>Deselect All</span>
                          </>
                        ) : (
                          <>
                            <Square className="w-4 h-4 text-gray-400" />
                            <span>Select All ({selectedMemeIds.size}/{generationResult.memes.length})</span>
                          </>
                        )}
                      </button>

                      {selectedMemeIds.size > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRegenerate(Array.from(selectedMemeIds))}
                          className="text-xs font-bold text-gray-600 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer bg-gray-50 hover:bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-200"
                        >
                          <RotateCw className="w-3.5 h-3.5" />
                          <span>Regenerate Selected</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        disabled={selectedMemeIds.size === 0 || isSaving}
                        onClick={handleSaveSelected}
                        className="w-full sm:w-auto px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white shadow-sm cursor-pointer transition-all flex items-center justify-center gap-1.5"
                      >
                        {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Bookmark className="w-3.5 h-3.5" />}
                        <span>Save Selected ({selectedMemeIds.size})</span>
                      </button>
                    </div>
                  </div>

                  {/* 2x2 Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {generationResult.memes.map((meme) => {
                      const isSelected = selectedMemeIds.has(meme.id);
                      const state = savingStatus[meme.id] || "idle";

                      return (
                        <div
                          key={meme.id}
                          className={`relative bg-white border rounded-3xl overflow-hidden transition-all flex flex-col justify-between ${
                            isSelected ? "border-blue-500 ring-2 ring-blue-500/20" : "border-gray-200"
                          }`}
                        >
                          {/* Top selection bar */}
                          <div className="p-3 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => toggleSelectMeme(meme.id)}
                              className="flex items-center gap-2 text-left cursor-pointer"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Square className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-[11px] font-bold text-gray-900 max-w-[160px] truncate">
                                {meme.templateTitle}
                              </span>
                            </button>

                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                                Confidence: {meme.confidence}%
                              </span>
                              <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 uppercase">
                                Tone: {meme.tone}
                              </span>
                            </div>
                          </div>

                          {/* Image rendering with overlays on client side */}
                          <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-gray-100 select-none">
                            {/* Finalized image if already compiled, otherwise client side mock */}
                            {meme.cloudinary_secure_url ? (
                              <img
                                src={meme.cloudinary_secure_url}
                                alt="Finalized Meme"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <>
                                <img
                                  src={meme.templateImageUrl || "/images/placeholders/meme-preview.png"}
                                  alt="Template format"
                                  className="w-full h-full object-contain"
                                />

                                {/* Render region overlays */}
                                {meme.textLayout === "regions" && meme.regions && Array.isArray(meme.regions) && (() => {
                                  const captions = meme.regionCaptions || {};
                                  return meme.regions.map((region: any) => {
                                    const text = captions[region.id] || "";
                                    if (!text.trim()) return null;

                                    return (
                                      <div
                                        key={region.id}
                                        className="absolute text-center uppercase text-white font-black tracking-tight leading-tight select-none pointer-events-none"
                                        style={{
                                          left: `${region.x}%`,
                                          top: `${region.y}%`,
                                          width: `${region.width}%`,
                                          transform: `translate(-50%, -50%) rotate(${region.angle || 0}deg)`,
                                          fontFamily: "Impact, 'Arial Black', sans-serif",
                                          fontSize: `min(3.2vw, ${20 * (region.fontSizeFactor || 1.0)}px)`,
                                          WebkitTextStroke: "1.5px black",
                                          textShadow: "1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 1.5px 0 #000, 0 -1.5px 0 #000, 1.5px 0 0 #000, -1.5px 0 0 #000",
                                        }}
                                      >
                                        {text}
                                      </div>
                                    );
                                  });
                                })()}

                                {/* Render top text overlay (Classic layout) */}
                                {meme.textLayout !== "regions" && meme.topText && (
                                  <div
                                    className="absolute top-4 left-0 w-full text-center px-4 font-black uppercase text-white tracking-tight"
                                    style={{
                                      fontFamily: "Impact, 'Arial Black', sans-serif",
                                      fontSize: "min(3.2vw, 24px)",
                                      WebkitTextStroke: "1px black",
                                      textShadow: "1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 1.5px 0 #000, 0 -1.5px 0 #000, 1.5px 0 0 #000, -1.5px 0 0 #000",
                                    }}
                                  >
                                    {meme.topText}
                                  </div>
                                )}

                                {/* Render bottom text overlay (Classic layout) */}
                                {meme.textLayout !== "regions" && meme.bottomText && (
                                  <div
                                    className="absolute bottom-4 left-0 w-full text-center px-4 font-black uppercase text-white tracking-tight"
                                    style={{
                                      fontFamily: "Impact, 'Arial Black', sans-serif",
                                      fontSize: "min(3.2vw, 24px)",
                                      WebkitTextStroke: "1px black",
                                      textShadow: "1.5px 1.5px 0 #000, -1.5px -1.5px 0 #000, 1.5px -1.5px 0 #000, -1.5px 1.5px 0 #000, 0 1.5px 0 #000, 0 -1.5px 0 #000, 1.5px 0 0 #000, -1.5px 0 0 #000",
                                    }}
                                  >
                                    {meme.bottomText}
                                  </div>
                                )}

                                {/* Preview Watermark overlay */}
                                {watermarkEnabled && (
                                  <div className="absolute bottom-3 right-3 opacity-25">
                                    <img
                                      src="/images/watermark.png"
                                      alt="Virlio Watermark"
                                      className="w-8 h-8 object-contain"
                                    />
                                  </div>
                                )}
                              </>
                            )}

                            {/* Processing/Saving overlay */}
                            {state === "saving" && (
                              <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2">
                                <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                <span className="text-[11px] font-bold text-gray-700">Compositing sharp output...</span>
                              </div>
                            )}

                            {state === "saved" && (
                              <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 transition-all">
                                <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                                  <Check className="w-5 h-5" />
                                </div>
                                <span className="text-[11px] font-bold text-emerald-800">Finalized & Uploaded!</span>
                              </div>
                            )}
                          </div>

                          {/* Footer options */}
                          <div className="p-3 bg-gray-50/50 border-t border-gray-100 space-y-2">
                            {/* AI-Generated Title & Description Editable Fields */}
                            <div className="space-y-2 pb-1">
                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                  Title
                                </label>
                                <input
                                  type="text"
                                  value={meme.title || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGenerationResult((prev) => {
                                      if (!prev) return null;
                                      return {
                                        ...prev,
                                        memes: prev.memes.map((m) => (m.id === meme.id ? { ...m, title: val } : m)),
                                      };
                                    });
                                  }}
                                  className="w-full px-2.5 py-1 text-xs font-bold bg-white border border-gray-200 rounded-lg text-gray-900 focus:ring-1 focus:ring-blue-500"
                                  placeholder="Meme Title..."
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                                  SEO Description
                                </label>
                                <textarea
                                  rows={2}
                                  value={meme.description || ""}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    setGenerationResult((prev) => {
                                      if (!prev) return null;
                                      return {
                                        ...prev,
                                        memes: prev.memes.map((m) => (m.id === meme.id ? { ...m, description: val } : m)),
                                      };
                                    });
                                  }}
                                  className="w-full px-2.5 py-1 text-[11px] bg-white border border-gray-200 rounded-lg text-gray-800 focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                                  placeholder="SEO Description..."
                                />
                              </div>
                            </div>

                            {/* AI reasoning text */}
                            <p className="text-[10px] text-gray-500 italic leading-relaxed">
                              &ldquo;{meme.reasonSelected}&rdquo;
                            </p>

                            <div className="flex items-center justify-between pt-1 border-t border-gray-100/50 gap-2">
                              {/* Hashtags display */}
                              <div className="flex gap-1 overflow-x-auto scrollbar-none max-w-[200px] shrink-0">
                                {meme.hashtags.slice(0, 3).map((tag, idx) => (
                                  <span key={idx} className="text-[9px] font-bold text-blue-600 bg-blue-50/50 border border-blue-100 px-1 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>

                              {/* Card action */}
                              {state === "idle" && (
                                <button
                                  type="button"
                                  onClick={() => handleRegenerate([meme.id])}
                                  className="text-[10px] font-bold text-gray-600 hover:text-blue-600 flex items-center gap-1 cursor-pointer bg-white hover:bg-gray-50 px-2 py-1 rounded-lg border border-gray-200"
                                >
                                  <RotateCw className="w-3 h-3" />
                                  <span>Regenerate</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Coming Soon Features Grid */}
          <div className="pt-6 border-t border-gray-200 space-y-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Explore Advanced Studio Modules</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1 */}
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-3xl opacity-60 space-y-3 relative group">
                <div className="absolute top-4 right-4 bg-gray-200 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-gray-300">
                  Coming Soon
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>AI Comic Strip Studio</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Sequentially chain templates to generate multi-panel narrative storytelling strips centered around your core product.
                </p>
              </div>

              {/* Card 2 */}
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-3xl opacity-60 space-y-3 relative group">
                <div className="absolute top-4 right-4 bg-gray-200 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-gray-300">
                  Coming Soon
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>AI Template Creator</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Describe a scene layout and let our AI assemble unique SVG-based composite templates on the fly.
                </p>
              </div>

              {/* Card 3 */}
              <div className="p-6 bg-gray-50 border border-gray-200 rounded-3xl opacity-60 space-y-3 relative group">
                <div className="absolute top-4 right-4 bg-gray-200 text-gray-700 text-[9px] font-bold px-2 py-0.5 rounded-full border border-gray-300">
                  Coming Soon
                </div>
                <div className="w-10 h-10 rounded-2xl bg-gray-200 text-gray-600 flex items-center justify-center">
                  <Tv className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <span>Animated Meme Generator</span>
                  <Lock className="w-3.5 h-3.5 text-gray-400" />
                </h4>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Overlay animated text frames and transparent brand overlays onto GIF and MP4 short video formats.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Published & Drafts history view */}
      {activeTab === "history" && (
        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              Finalized Studio Output History
            </h2>
            <span className="text-xs text-gray-500 font-mono">{history.length} Saved Items</span>
          </div>

          {loadingHistory && (
            <div className="py-12 flex justify-center items-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            </div>
          )}

          {!loadingHistory && history.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-500 font-medium">
              No saved memes in history. Use the studio generator to compose and save your first branded meme.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {history.map((meme) => (
                <div key={meme.id} className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center">
                    <img
                      src={meme.cloudinary_secure_url || "/images/placeholders/meme-preview.png"}
                      alt="Rendered Meme"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[9px] font-bold text-gray-400">
                      <span>Saved: {new Date(meme.created_at || Date.now()).toLocaleDateString()}</span>
                      <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 uppercase">
                        {meme.status}
                      </span>
                    </div>

                    <p className="text-xs text-gray-900 font-bold line-clamp-2">
                      {meme.generated_caption || meme.prompt || "Branded Meme"}
                    </p>

                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      {/* Social indicators */}
                      <span className="text-[10px] text-gray-500 font-semibold">
                        Tone: {meme.ai_tone || "Witty"}
                      </span>

                      <a
                        href={meme.cloudinary_secure_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                      >
                        <span>Open Image</span>
                        <ArrowRight className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
