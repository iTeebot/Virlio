"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Edit3,
  Download,
  Check,
  RotateCcw,
  Shield,
  Copy,
  CheckCheck,
  Send,
  Loader2,
} from "lucide-react";
import { VersionHistoryTree, VersionNode } from "./version-history-tree";

interface InteractiveImageEditorProps {
  brandId: string;
  variation: {
    id: string;
    concept_title: string;
    concept_description: string;
    headline_text?: string | null;
    body_copy?: string | null;
    caption_copy?: string | null;
    hashtags?: string[] | null;
    is_approved?: boolean;
    active_version?: {
      id: string;
      version_number: number;
      image_url: string;
      aspect_ratio: string;
      edit_instruction?: string | null;
      created_at: string | Date;
    } | null;
  };
  versions?: VersionNode[];
  onSelectVersion?: (version: VersionNode) => void;
  onApproveToggle?: (approved: boolean) => void;
  onEditSubmitted?: (newVersion: any) => void;
}

export function InteractiveImageEditor({
  brandId,
  variation,
  versions = [],
  onSelectVersion,
  onApproveToggle,
  onEditSubmitted,
}: InteractiveImageEditorProps) {
  const [editInstruction, setEditInstruction] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeVersion = variation.active_version;
  const activeImageUrl = activeVersion?.image_url;

  const quickEditChips = [
    "Darken background to solid navy",
    "Brighten studio lighting",
    "Enhance product rim light",
    "Make composition more minimalist",
    "Warm daylight ambient shadows",
  ];

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInstruction.trim() || !activeVersion?.id || isEditing) return;

    try {
      setIsEditing(true);
      setError(null);

      const res = await fetch(`/api/v1/brands/${brandId}/posts/variations/${variation.id}/edit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parent_version_id: activeVersion.id,
          edit_instruction: editInstruction.trim(),
          aspect_ratio: activeVersion.aspect_ratio || "1:1",
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to generate image revision");
      }

      setEditInstruction("");
      onEditSubmitted?.(json.data);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsEditing(false);
    }
  };

  const handleCopyCaption = () => {
    const fullCaption = `${variation.caption_copy || ""}\n\n${(variation.hashtags || []).join(" ")}`;
    navigator.clipboard.writeText(fullCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="virlio-card bg-white border border-gray-200 rounded-xl overflow-hidden shadow-xs space-y-6 p-5 sm:p-6">
      {/* 1. Header with Title & Quick Approval */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-150 pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
            Interactive Version Studio
          </span>
          <h2 className="text-base font-bold text-gray-900">{variation.concept_title}</h2>
          <p className="text-xs text-gray-500 max-w-xl">{variation.concept_description}</p>
        </div>

        <div className="flex items-center gap-2">
          {activeImageUrl && (
            <a
              href={activeImageUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all border border-gray-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </a>
          )}

          {onApproveToggle && (
            <button
              type="button"
              onClick={() => onApproveToggle(!variation.is_approved)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all border ${
                variation.is_approved
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                  : "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{variation.is_approved ? "Approved Asset ✓" : "Approve as Official"}</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Version Lineage Tree */}
      {versions.length > 1 && activeVersion && onSelectVersion && (
        <VersionHistoryTree
          versions={versions}
          activeVersionId={activeVersion.id}
          onSelectVersion={onSelectVersion}
        />
      )}

      {/* 3. Main Workspace: Canvas & Edit Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: High-Res Image Canvas */}
        <div className="lg:col-span-7 space-y-3">
          <div className="relative aspect-square w-full rounded-xl bg-gray-950 border border-gray-200 overflow-hidden flex items-center justify-center shadow-inner">
            {activeImageUrl ? (
              <Image
                src={activeImageUrl}
                alt={variation.concept_title}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 60vw"
                unoptimized
              />
            ) : (
              <div className="p-8 text-center text-gray-400 space-y-2">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-500" />
                <p className="text-xs">Preparing active image version...</p>
              </div>
            )}

            {activeVersion && (
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/80 text-white text-[11px] font-mono font-bold backdrop-blur-xs border border-white/10">
                Active: Version {activeVersion.version_number}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 px-1">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Solid colors & brand geometry locked
            </span>
            {activeVersion?.aspect_ratio && (
              <span className="font-mono">Aspect Ratio: {activeVersion.aspect_ratio}</span>
            )}
          </div>
        </div>

        {/* Right: Revision Controls & Copywriting */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          {/* Edit Instruction Form */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-900 mb-1">
                Prompt Image Revision
              </label>
              <p className="text-[11px] text-gray-500">
                Describe desired modifications. Virlio automatically preserves your product, logo, and solid brand palette.
              </p>
            </div>

            {/* Quick Edit Chips */}
            <div className="flex flex-wrap gap-1.5">
              {quickEditChips.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setEditInstruction(chip)}
                  className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all border border-gray-200"
                >
                  + {chip}
                </button>
              ))}
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-2">
              <div className="relative">
                <textarea
                  rows={3}
                  value={editInstruction}
                  onChange={(e) => setEditInstruction(e.target.value)}
                  placeholder="e.g. Change surface background to solid dark navy #0F172A and add subtle rim light..."
                  className="w-full p-3 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:bg-white transition-all resize-none"
                  disabled={isEditing}
                />
              </div>

              {error && (
                <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={!editInstruction.trim() || isEditing || !activeVersion?.id}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
              >
                {isEditing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Revision...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Generate Revision</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Branded Social Copy Preview */}
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
                Social Copy & Caption
              </span>
              <button
                type="button"
                onClick={handleCopyCaption}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700"
              >
                {copiedCaption ? <CheckCheck className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                <span>{copiedCaption ? "Copied!" : "Copy All"}</span>
              </button>
            </div>

            {variation.headline_text && (
              <div className="text-xs font-serif font-bold text-gray-900 border-l-2 border-blue-600 pl-2.5">
                {variation.headline_text}
              </div>
            )}

            {variation.caption_copy && (
              <p className="text-xs text-gray-700 whitespace-pre-wrap line-clamp-4">
                {variation.caption_copy}
              </p>
            )}

            {variation.hashtags && variation.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {variation.hashtags.map((h, i) => (
                  <span key={i} className="text-[10px] font-mono text-blue-700 font-medium">
                    {h}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
