"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { BrandStyleSelect } from "@/components/ui/brand-style-select";
import { extractColorsFromImage } from "@/lib/utils/color-extractor";
import {
  Bot,
  Save,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Clock,
  Check,
  X,
  History,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  BookOpen,
  Palette,
} from "lucide-react";

const BRAND_TONES = [
  "Friendly & Informative",
  "Witty & Humorous",
  "Professional & Authoritative",
  "Bold & Rebellious",
  "Educational & Helpful",
  "Casual & Relatable",
  "Sarcastic & Edgier",
  "Luxury & Refined",
  "Playful & Quirky",
];

const WRITING_STYLES = [
  "Concise & Punchy",
  "Conversational & Storytelling",
  "Technical & Detailed",
  "Informal & Meme-Centric",
  "Formal & Corporate",
];

const PERSONALITY_TRAITS = [
  "Professional",
  "Funny",
  "Luxury",
  "Minimal",
  "Modern",
  "Corporate",
  "Bold",
  "Friendly",
  "Playful",
  "Technical",
  "Educational",
  "Premium",
];

interface AiHistoryItem {
  id: string;
  version: number;
  change_summary: string | null;
  created_at: string;
  user?: {
    name?: string | null;
    username?: string | null;
    image?: string | null;
  } | null;
  knowledge_base: any;
}

export default function BrandAIPage() {
  const { currentBrand } = useBrand();

  const [activeTab, setActiveTab] = useState<"editor" | "history">("editor");

  const [kbData, setKbData] = useState<any>({
    identity: { personality: ["Professional", "Modern"], brand_style: "Modern" },
    brand_voice: { tone: "Friendly & Informative", communication_style: "Concise & Punchy", tagline: "", mission: "" },
    audience: { target_age_groups: ["18-34", "35-54"], target_languages: ["English"], audience_interests: ["Technology", "Marketing"] },
    restrictions: { words_avoid: [], topics_avoid: ["Politics", "Religion"], humor_allowed: true },
    keywords: ["Meme Marketing", "SaaS"],
    preferred_ctas: ["Try Virlio Free"],
    colors: { primary: "#2563eb", secondary: "#7c3aed", accent: "#f59e0b" },
  });

  const [initialKb, setInitialKb] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Suggestions state per section
  const [suggestingSection, setSuggestingSection] = useState<string | null>(null);
  const [activeSuggestions, setActiveSuggestions] = useState<Record<string, any>>({});

  // History state
  const [historyList, setHistoryList] = useState<AiHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Tag inputs
  const [newAvoidTopic, setNewAvoidTopic] = useState("");
  const [newKeyword, setNewKeyword] = useState("");
  const [newCta, setNewCta] = useState("");

  const loadKb = async () => {
    if (!currentBrand?.id) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/knowledge`);
      if (res.ok) {
        const json = await res.json();
        const loaded = json.data || json;
        if (loaded && Object.keys(loaded).length > 0) {
          setKbData(loaded);
          setInitialKb(loaded);
        }
      }
    } catch (err) {
      console.error("Failed to load Knowledge Base:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!currentBrand?.id) return;
    try {
      setLoadingHistory(true);
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/knowledge/history`);
      if (res.ok) {
        const json = await res.json();
        setHistoryList(json.data || []);
      }
    } catch (err) {
      console.error("Failed to load AI History:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadKb();
  }, [currentBrand?.id]);

  useEffect(() => {
    if (activeTab === "history") {
      loadHistory();
    }
  }, [activeTab, currentBrand?.id]);

  if (!currentBrand) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/knowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kbData),
      });

      if (res.ok) {
        setInitialKb(kbData);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        alert("Failed to save Knowledge Base.");
      }
    } catch {
      alert("Network error. Failed to save Knowledge Base.");
    } finally {
      setSaving(false);
    }
  };

  const handleSuggest = async (section: string, currentValue: any) => {
    setSuggestingSection(section);
    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/knowledge/suggest`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, currentValue }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.suggestion) {
          setActiveSuggestions((prev) => ({ ...prev, [section]: json.data.suggestion }));
        }
      }
    } catch (err) {
      console.error("Failed AI suggestion:", err);
    } finally {
      setSuggestingSection(null);
    }
  };

  const handleAcceptSuggestion = (section: string, updater: (val: any) => void) => {
    const sug = activeSuggestions[section];
    if (sug) {
      updater(sug);
      setActiveSuggestions((prev) => {
        const copy = { ...prev };
        delete copy[section];
        return copy;
      });
    }
  };

  const handleRejectSuggestion = (section: string) => {
    setActiveSuggestions((prev) => {
      const copy = { ...prev };
      delete copy[section];
      return copy;
    });
  };

  const handleRestoreVersion = async (historyId: string) => {
    if (!confirm("Are you sure you want to restore this AI configuration version?")) return;
    setRestoringId(historyId);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/knowledge/history`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ historyId }),
      });

      if (res.ok) {
        await loadKb();
        setActiveTab("editor");
        alert("Restored version successfully!");
      }
    } catch {
      alert("Failed to restore version.");
    } finally {
      setRestoringId(null);
    }
  };

  const togglePersonality = (trait: string) => {
    const current = kbData.identity?.personality || [];
    const updated = current.includes(trait)
      ? current.filter((t: string) => t !== trait)
      : [...current, trait];
    setKbData({
      ...kbData,
      identity: { ...(kbData.identity || {}), personality: updated },
    });
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Bot className="w-5 h-5 text-blue-600" />
              {currentBrand.name} Brand AI Strategy & Rules
            </h1>
            <p className="text-xs text-gray-500">
              Configure tone dropdowns, brand personality chips, audience rules, and restrictions consumed by Virlio's AI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("editor")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  activeTab === "editor" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Visual Editor
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("history")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === "history" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Version History</span>
              </button>
            </div>

            {activeTab === "editor" && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save AI Rules</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Brand AI Rules saved and snapshot version recorded!</span>
          </div>
        )}

        {/* TAB 1: VISUAL AI EDITOR */}
        {activeTab === "editor" && (
          <div className="space-y-8">
            {/* 1. BRAND VOICE & TONE SELECTORS */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    1. Brand Tone & Communication Dropdowns
                  </h3>
                  <p className="text-[11px] text-gray-500">Defines how AI writes captions for your brand.</p>
                </div>

                <button
                  type="button"
                  disabled={suggestingSection === "brand_voice"}
                  onClick={() => handleSuggest("brand_voice", kbData.brand_voice)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {suggestingSection === "brand_voice" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  )}
                  <span>Improve Tone with AI</span>
                </button>
              </div>

              {/* Active AI Suggestion Banner */}
              {activeSuggestions["brand_voice"] && (
                <div className="p-4 bg-violet-50 border border-violet-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-violet-900">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-violet-600" /> AI Suggested Tone Update
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleAcceptSuggestion("brand_voice", (sug) =>
                            setKbData((prev: any) => ({
                              ...prev,
                              brand_voice: typeof sug === "object" ? { ...prev.brand_voice, ...sug } : prev.brand_voice,
                            }))
                          )
                        }
                        className="px-2.5 py-1 bg-violet-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-violet-700"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectSuggestion("brand_voice")}
                        className="px-2.5 py-1 bg-white text-gray-700 border border-gray-200 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-gray-100"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                  <pre className="text-[11px] font-mono bg-white p-2.5 rounded-xl border border-violet-100 text-violet-900 whitespace-pre-wrap">
                    {JSON.stringify(activeSuggestions["brand_voice"], null, 2)}
                  </pre>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Brand Tone Dropdown</label>
                  <select
                    value={kbData.brand_voice?.tone || "Friendly & Informative"}
                    onChange={(e) =>
                      setKbData({
                        ...kbData,
                        brand_voice: { ...(kbData.brand_voice || {}), tone: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900"
                  >
                    {BRAND_TONES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Writing Style Dropdown</label>
                  <select
                    value={kbData.brand_voice?.communication_style || "Concise & Punchy"}
                    onChange={(e) =>
                      setKbData({
                        ...kbData,
                        brand_voice: { ...(kbData.brand_voice || {}), communication_style: e.target.value },
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-semibold text-gray-900"
                  >
                    {WRITING_STYLES.map((ws) => (
                      <option key={ws} value={ws}>
                        {ws}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={kbData.brand_voice?.tagline || ""}
                  onChange={(e) =>
                    setKbData({
                      ...kbData,
                      brand_voice: { ...(kbData.brand_voice || {}), tagline: e.target.value },
                    })
                  }
                  className="w-full px-3.5 py-2 text-xs bg-white border border-gray-300 rounded-xl text-gray-900"
                  placeholder="e.g. The AI Meme Platform for Brands"
                />
              </div>
            </div>

            {/* 2. BRAND PERSONALITY TRAITS CHIPS */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    2. Brand Personality Traits
                  </h3>
                  <p className="text-[11px] text-gray-500">Select personality traits matching your brand identity.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {PERSONALITY_TRAITS.map((trait) => {
                  const selected = (kbData.identity?.personality || []).includes(trait);
                  return (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => togglePersonality(trait)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        selected
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {selected ? `✓ ${trait}` : `+ ${trait}`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. RESTRICTIONS & AVOID TOPICS */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    3. Safety Rules & Topics to Avoid
                  </h3>
                  <p className="text-[11px] text-gray-500">Topics and phrases AI generator will never write.</p>
                </div>

                <button
                  type="button"
                  disabled={suggestingSection === "restrictions"}
                  onClick={() => handleSuggest("restrictions", kbData.restrictions)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 text-violet-700 border border-violet-200 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                  {suggestingSection === "restrictions" ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5 text-violet-600" />
                  )}
                  <span>Refine Restrictions with AI</span>
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">Avoid Topics (Blocked Keywords)</label>
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    {(kbData.restrictions?.topics_avoid || []).map((topic: string, i: number) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 border border-red-200 text-xs font-bold rounded-lg"
                      >
                        <span>{topic}</span>
                        <button
                          type="button"
                          onClick={() =>
                            setKbData({
                              ...kbData,
                              restrictions: {
                                ...(kbData.restrictions || {}),
                                topics_avoid: (kbData.restrictions?.topics_avoid || []).filter(
                                  (_: any, idx: number) => idx !== i
                                ),
                              },
                            })
                          }
                          className="hover:text-red-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newAvoidTopic}
                      onChange={(e) => setNewAvoidTopic(e.target.value)}
                      placeholder="Add topic to avoid (e.g. Politics)..."
                      className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newAvoidTopic.trim()) return;
                        setKbData({
                          ...kbData,
                          restrictions: {
                            ...(kbData.restrictions || {}),
                            topics_avoid: [...(kbData.restrictions?.topics_avoid || []), newAvoidTopic.trim()],
                          },
                        });
                        setNewAvoidTopic("");
                      }}
                      className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. APPROVED KEYWORDS & CTAS */}
            <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    4. Target Keywords & Calls to Action
                  </h3>
                  <p className="text-[11px] text-gray-500">Keywords and CTAs AI will organically weave into captions.</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">Approved Brand Keywords</label>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {(kbData.keywords || []).map((kw: string, i: number) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold rounded-lg"
                    >
                      <span>{kw}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setKbData({
                            ...kbData,
                            keywords: (kbData.keywords || []).filter((_: any, idx: number) => idx !== i),
                          })
                        }
                        className="hover:text-blue-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    placeholder="Add approved keyword..."
                    className="px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newKeyword.trim()) return;
                      setKbData({
                        ...kbData,
                        keywords: [...(kbData.keywords || []), newKeyword.trim()],
                      });
                      setNewKeyword("");
                    }}
                    className="px-3 py-1.5 bg-gray-900 text-white rounded-xl text-xs font-bold hover:bg-gray-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VERSION HISTORY */}
        {activeTab === "history" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <History className="w-4 h-4 text-blue-600" /> AI Strategy Version Snapshots
              </h3>
              <button
                type="button"
                onClick={loadHistory}
                disabled={loadingHistory}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Refresh History
              </button>
            </div>

            {loadingHistory ? (
              <div className="py-12 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-blue-600 mx-auto" />
              </div>
            ) : historyList.length === 0 ? (
              <div className="p-8 text-center bg-gray-50 border border-gray-200 rounded-2xl space-y-2">
                <History className="w-8 h-8 text-gray-400 mx-auto" />
                <h4 className="text-xs font-bold text-gray-900">No previous version snapshots</h4>
                <p className="text-[11px] text-gray-500">
                  Version snapshots will automatically record here whenever you modify and save AI settings.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {historyList.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 bg-white border border-gray-200 rounded-2xl flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-extrabold text-[10px] rounded border border-blue-200">
                          v{item.version}
                        </span>
                        <span className="text-xs font-bold text-gray-900">
                          {item.change_summary || `AI Knowledge Version ${item.version}`}
                        </span>
                      </div>

                      <p className="text-[11px] text-gray-500 flex items-center gap-2">
                        <span>Updated by {item.user?.name || "Team Member"}</span>
                        <span>•</span>
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={restoringId === item.id}
                      onClick={() => handleRestoreVersion(item.id)}
                      className="px-3 py-1.5 text-xs font-bold bg-white text-gray-800 border border-gray-200 rounded-xl hover:bg-gray-50 shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                    >
                      {restoringId === item.id ? "Restoring..." : "Restore Version"}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
