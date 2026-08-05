"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { EmptyState } from "@/components/dashboard/empty-state";
import { toast } from "@/components/ui/toast";
import {
  Flame,
  Loader2,
  Trash2,
  Globe,
  EyeOff,
  ExternalLink,
  RotateCw,
  Sparkles,
  Share2,
  CheckCircle2,
  Camera,
} from "lucide-react";

interface MemeItem {
  id: string;
  top_text: string | null;
  bottom_text: string | null;
  region_captions: Record<string, string> | null;
  text_layout: string;
  cloudinary_secure_url: string | null;
  visibility: "public" | "private";
  status: string;
  ai_tone: string | null;
  ai_confidence: number | null;
  created_at: string;
}

export default function BrandMemesPage() {
  const { currentBrand } = useBrand();
  const [memesList, setMemesList] = useState<MemeItem[]>([]);
  const [pubHistory, setPubHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [publishingMemeId, setPublishingMemeId] = useState<string | null>(null);

  const fetchMemes = async () => {
    if (!currentBrand?.id) return;
    try {
      setLoading(true);
      const [res, historyRes] = await Promise.all([
        fetch(`/api/v1/memes?brandId=${currentBrand.id}`),
        fetch(`/api/v1/brands/${currentBrand.id}/socials/history`),
      ]);

      if (res.ok) {
        const json = await res.json();
        const accepted = (json.data || []).filter(
          (m: MemeItem) => m.status === "accepted" && m.cloudinary_secure_url
        );
        setMemesList(accepted);
      }

      if (historyRes.ok) {
        const historyJson = await historyRes.json();
        setPubHistory(historyJson.data || []);
      }
    } catch (err) {
      console.error("Failed to load memes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemes();
  }, [currentBrand?.id]);

  const handlePostToFacebook = async (memeId: string) => {
    if (!currentBrand?.id) return;
    setPublishingMemeId(memeId);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/socials/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memeId,
          platform: "facebook",
          appendAttribution: true,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Published meme to Facebook Page (${json.data.pageName})!`, "Social Publisher");
        await fetchMemes();
      } else {
        toast.error(json.error || "Failed to publish to Facebook", "Duplicate Prevention");
      }
    } catch {
      toast.error("Network error publishing to Facebook", "Error");
    } finally {
      setPublishingMemeId(null);
    }
  };

  const handlePostToCamera = async (memeId: string) => {
    if (!currentBrand?.id) return;
    setPublishingMemeId(memeId);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/socials/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memeId,
          platform: "instagram",
          appendAttribution: true,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Published meme to Camera (${json.data.pageName})!`, "Social Publisher");
        await fetchMemes();
      } else {
        toast.error(json.error || "Failed to publish to Camera", "Duplicate Prevention");
      }
    } catch {
      toast.error("Network error publishing to Camera", "Error");
    } finally {
      setPublishingMemeId(null);
    }
  };

  const handlePostToThreads = async (memeId: string) => {
    if (!currentBrand?.id) return;
    setPublishingMemeId(memeId);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/socials/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memeId,
          platform: "threads",
          appendAttribution: true,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        toast.success(`Published meme to Threads (${json.data.pageName})!`, "Social Publisher");
        await fetchMemes();
      } else {
        toast.error(json.error || "Failed to publish to Threads", "Duplicate Prevention");
      }
    } catch {
      toast.error("Network error publishing to Threads", "Error");
    } finally {
      setPublishingMemeId(null);
    }
  };

  const handleToggleVisibility = async (id: string, currentVisibility: "public" | "private") => {
    setActionId(id);
    const newVisibility = currentVisibility === "public" ? "private" : "public";
    try {
      const res = await fetch(`/api/v1/memes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          visibility: newVisibility,
        }),
      });

      if (res.ok) {
        setMemesList((prev) =>
          prev.map((m) => (m.id === id ? { ...m, visibility: newVisibility } : m))
        );
      }
    } catch (err) {
      console.error("Failed to toggle visibility:", err);
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteMeme = async (id: string) => {
    if (!confirm("Are you sure you want to delete this meme from your library?")) return;
    setActionId(id);
    try {
      const res = await fetch(`/api/v1/memes?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMemesList((prev) => prev.filter((m) => m.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete meme:", err);
    } finally {
      setActionId(null);
    }
  };

  if (!currentBrand) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-1">
              <Flame className="w-5 h-5 text-amber-500" />
              {currentBrand.name} Meme Library
            </h1>
            <p className="text-xs text-gray-500">
              Manage, publish, and clean up your finalized brand memes.
            </p>
          </div>
          
          {memesList.length > 0 && (
            <button
              onClick={fetchMemes}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 shadow-2xs cursor-pointer transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          )}
        </div>

        {loading && memesList.length === 0 ? (
          <div className="py-20 flex justify-center items-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : memesList.length === 0 ? (
          <EmptyState
            icon={Flame}
            title="No memes in library"
            description={`No memes have been saved to ${currentBrand.name}'s library yet.`}
            actionLabel="Generate First Meme"
            actionHref={`/dashboard/brands/${currentBrand.id}/generate`}
            iconColor="text-amber-500"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {memesList.map((meme) => {
              const isProcessing = actionId === meme.id;
              const isPublic = meme.visibility === "public";

              return (
                <div
                  key={meme.id}
                  className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-2xs flex flex-col justify-between group relative"
                >
                  {/* Meme Image Preview */}
                  <div className="relative aspect-square w-full bg-slate-950 flex items-center justify-center overflow-hidden">
                    <img
                      src={meme.cloudinary_secure_url || "/images/placeholders/meme-preview.png"}
                      alt="Branded Meme"
                      className="w-full h-full object-contain"
                    />

                    {/* Action Loader Overlay */}
                    {isProcessing && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                      </div>
                    )}
                  </div>

                  {/* Info Details */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-gray-400">
                      <span>Saved: {new Date(meme.created_at).toLocaleDateString()}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          isPublic
                            ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : "text-gray-600 bg-gray-50 border-gray-200"
                        }`}
                      >
                        {meme.visibility.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-gray-800 font-bold line-clamp-2">
                      {meme.region_captions
                        ? Object.entries(meme.region_captions)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" | ")
                        : meme.top_text || meme.bottom_text || "Branded Meme"}
                    </p>

                    <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {meme.ai_tone && (
                          <span className="text-[9px] font-extrabold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 uppercase">
                            Tone: {meme.ai_tone}
                          </span>
                        )}
                        {meme.ai_confidence && (
                          <span className="text-[9px] font-extrabold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-100 uppercase">
                            Score: {meme.ai_confidence}%
                          </span>
                        )}
                      </div>

                      {meme.cloudinary_secure_url && (
                        <a
                          href={meme.cloudinary_secure_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-gray-500 hover:text-blue-600 flex items-center gap-0.5 hover:underline"
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Social Publishing & Manage Actions */}
                    <div className="pt-3 border-t border-gray-100 space-y-2">
                      <div className="grid grid-cols-1 gap-1.5">
                        {/* Facebook Publishing Action */}
                        {(() => {
                          const fbHistory = pubHistory.find((h) => h.meme_id === meme.id && h.platform === "facebook");

                          if (fbHistory) {
                            return (
                              <div className="p-2 bg-blue-50 border border-blue-100 rounded-xl text-center space-y-0.5">
                                <span className="text-[10px] font-black text-blue-900 flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                                  Posted to FB ({fbHistory.page_name || "Page"})
                                </span>
                                <span className="text-[9px] text-blue-700 block">
                                  {new Date(fbHistory.published_at).toLocaleDateString()}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => handlePostToFacebook(meme.id)}
                              disabled={publishingMemeId === meme.id}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              {publishingMemeId === meme.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Share2 className="w-3.5 h-3.5" />
                              )}
                              <span>Post to Facebook</span>
                            </button>
                          );
                        })()}

                        {/* Instagram Publishing Action */}
                        {(() => {
                          const igHistory = pubHistory.find((h) => h.meme_id === meme.id && h.platform === "instagram");

                          if (igHistory) {
                            return (
                              <div className="p-2 bg-pink-50 border border-pink-100 rounded-xl text-center space-y-0.5">
                                <span className="text-[10px] font-black text-pink-900 flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-pink-600" />
                                  Posted to IG ({igHistory.page_name || "Account"})
                                </span>
                                <span className="text-[9px] text-pink-700 block">
                                  {new Date(igHistory.published_at).toLocaleDateString()}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => handlePostToCamera(meme.id)}
                              disabled={publishingMemeId === meme.id}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              {publishingMemeId === meme.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Camera className="w-3.5 h-3.5" />
                              )}
                              <span>Post to Instagram</span>
                            </button>
                          );
                        })()}

                        {/* Threads Publishing Action */}
                        {(() => {
                          const threadsHistory = pubHistory.find((h) => h.meme_id === meme.id && h.platform === "threads");

                          if (threadsHistory) {
                            return (
                              <div className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-center space-y-0.5">
                                <span className="text-[10px] font-black text-slate-900 flex items-center justify-center gap-1">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-700" />
                                  Posted to Threads ({threadsHistory.page_name || "Account"})
                                </span>
                                <span className="text-[9px] text-slate-600 block">
                                  {new Date(threadsHistory.published_at).toLocaleDateString()}
                                </span>
                              </div>
                            );
                          }

                          return (
                            <button
                              type="button"
                              onClick={() => handlePostToThreads(meme.id)}
                              disabled={publishingMemeId === meme.id}
                              className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl bg-slate-900 hover:bg-black disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            >
                              {publishingMemeId === meme.id ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Globe className="w-3.5 h-3.5 text-white" />
                              )}
                              <span>Post to Threads</span>
                            </button>
                          );
                        })()}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleToggleVisibility(meme.id, meme.visibility)}
                          disabled={isProcessing}
                          className={`flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer border ${
                            isPublic
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200"
                          }`}
                        >
                          {isPublic ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Make Private</span>
                            </>
                          ) : (
                            <>
                              <Globe className="w-3.5 h-3.5" />
                              <span>Publish Feed</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteMeme(meme.id)}
                          disabled={isProcessing}
                          className="inline-flex items-center justify-center p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 cursor-pointer transition-colors"
                          title="Delete Meme"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
