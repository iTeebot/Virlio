"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { Upload, Link as LinkIcon, RefreshCw, Trash2, Eye, User, Sparkles, Check, Move, X } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { UserAvatar } from "@/components/ui/user-avatar";

interface AvatarDPUploaderProps {
  avatarUrl?: string;
  onChange: (url: string) => void;
  name?: string;
  username?: string;
  folder?: string;
  maxSizeMb?: number;
}

export function AvatarDPUploader({
  avatarUrl = "",
  onChange,
  name = "User",
  username = "username",
  folder = "virlio/user-avatars",
  maxSizeMb = 5,
}: AvatarDPUploaderProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [objectPosition, setObjectPosition] = useState<"center" | "top" | "bottom" | "left" | "right">("center");
  const [objectFit, setObjectFit] = useState<"cover" | "contain">("cover");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (displayName: string) => {
    if (!displayName) return "U";
    const parts = displayName.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return displayName.slice(0, 2).toUpperCase();
  };

  // Direct File Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError(null);

    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds limit of ${maxSizeMb}MB.`);
      toast.error(`File size exceeds limit of ${maxSizeMb}MB.`, "Upload Failed");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Upload JPEG, PNG, WEBP, or SVG.");
      toast.error("Invalid file type. Upload JPEG, PNG, WEBP, or SVG.", "Upload Failed");
      return;
    }

    setIsUploading(true);
    setUploadProgress(25);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? prev : prev + 15));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("assetType", "avatar");

      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      const json = await res.json();
      if (res.ok && json.url) {
        setUploadProgress(100);
        setTimeout(() => {
          const { applyAvatarPosition } = require("@/lib/utils/avatar-position");
          const canonicalUrl = applyAvatarPosition(json.url, objectPosition, objectFit);
          onChange(canonicalUrl);
          setIsUploading(false);
          setUploadProgress(0);
          toast.success("Profile photo updated successfully!", "Avatar Uploaded");
        }, 300);
      } else {
        throw new Error(json.message || "Failed to upload profile photo.");
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      const msg = err.message || "Upload failed. Please try again.";
      setError(msg);
      toast.error(msg, "Upload Failed");
    }
  };

  // URL Upload
  const handleUrlUpload = async () => {
    if (!urlInput || !urlInput.trim()) return;
    setError(null);
    setIsUploading(true);

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), assetType: "avatar" }),
      });

      const json = await res.json();
      const { applyAvatarPosition } = require("@/lib/utils/avatar-position");
      const targetUrl = res.ok && json.url ? json.url : urlInput.trim();
      const canonicalUrl = applyAvatarPosition(targetUrl, objectPosition, objectFit);
      onChange(canonicalUrl);
      setUrlInput("");
      toast.success("Profile photo URL saved!", "Avatar Saved");
    } catch (err: any) {
      const { applyAvatarPosition } = require("@/lib/utils/avatar-position");
      const canonicalUrl = applyAvatarPosition(urlInput.trim(), objectPosition, objectFit);
      onChange(canonicalUrl);
      setUrlInput("");
      toast.success("Profile photo URL saved!", "Avatar Saved");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    onChange("");
    setUrlInput("");
    toast.info("Profile photo removed. Showing default initials.", "Avatar Removed");
  };

  return (
    <div className="space-y-4">
      {/* Container Card */}
      <div className="p-5 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          {/* Circular DP Avatar Preview as seen across Virlio */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="relative">
                <UserAvatar
                  src={avatarUrl}
                  name={name}
                  username={username}
                  size="2xl"
                  priority
                />

                {/* Loading overlay */}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white p-2">
                    <RefreshCw className="w-6 h-6 animate-spin mb-1 text-blue-400" />
                    <span className="text-[10px] font-bold">{uploadProgress}%</span>
                  </div>
                )}
              </div>

              {/* Verified / Active indicator badge */}
              <div className="absolute bottom-0 right-0 p-1.5 bg-blue-600 text-white rounded-full border-2 border-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-gray-900">{name || "Display Name"}</h4>
                <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                  @{username || "handle"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed">
                Exact circular preview as shown on your public profile, leaderboards, and comments.
              </p>
              
              {avatarUrl && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreviewModal(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview & Adjust Position</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Tabs & Buttons */}
          <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
            {/* Upload Mode Switcher */}
            <div className="flex rounded-xl bg-gray-200/70 p-1 text-[11px] font-bold text-gray-600">
              <button
                type="button"
                onClick={() => setUploadMode("file")}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  uploadMode === "file" ? "bg-white text-gray-900 shadow-2xs" : "hover:text-gray-900"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => {
                  setUploadMode("url");
                  setUrlInput(avatarUrl || "");
                }}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  uploadMode === "url" ? "bg-white text-gray-900 shadow-2xs" : "hover:text-gray-900"
                }`}
              >
                Paste URL
              </button>
            </div>

            {uploadMode === "file" ? (
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-2xs disabled:opacity-50 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{avatarUrl ? "Replace DP" : "Upload DP"}</span>
                </button>
                
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemove}
                    disabled={isUploading}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
                    title="Remove Profile Photo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex gap-1.5 w-full sm:w-72">
                <input
                  type="url"
                  value={urlInput || ""}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleUrlUpload}
                  disabled={isUploading || !urlInput.trim()}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
                >
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        {error && (
          <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            ⚠️ {error}
          </p>
        )}
      </div>

      {/* High-Definition Live Preview & Repositioning Modal */}
      {showPreviewModal && avatarUrl && (
        <div className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Profile DP Preview & Alignment</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Public Profile Card Live Preview */}
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block text-center">
                Public Profile Card Preview
              </span>

              <div className="flex flex-col items-center text-center p-4 bg-white rounded-2xl border border-gray-200 shadow-sm">
                <div className="w-24 h-24 rounded-full border-4 border-white ring-2 ring-blue-500/30 overflow-hidden relative shadow-md mb-2 bg-gray-100">
                  <Image
                    src={avatarUrl}
                    alt={`${name}'s Display Picture`}
                    fill
                    sizes="96px"
                    style={{ objectFit, objectPosition }}
                    unoptimized={avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")}
                  />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{name || "Display Name"}</h4>
                <p className="text-xs text-blue-600 font-semibold">@{username || "handle"}</p>
              </div>
            </div>

            {/* Reposition & Fitting Controls */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-800">
                Focal Alignment (Object Position)
              </label>
              <div className="grid grid-cols-5 gap-2 text-xs font-bold">
                {(["center", "top", "bottom", "left", "right"] as const).map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => {
                      setObjectPosition(pos);
                      if (avatarUrl) {
                        const { applyAvatarPosition } = require("@/lib/utils/avatar-position");
                        const canonicalUrl = applyAvatarPosition(avatarUrl, pos, objectFit);
                        onChange(canonicalUrl);
                      }
                    }}
                    className={`py-2 px-2 rounded-xl capitalize transition-all border ${
                      objectPosition === pos
                        ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-bold text-gray-800">Scaling Strategy</label>
                <div className="flex gap-2 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => {
                      setObjectFit("cover");
                      if (avatarUrl) {
                        const { applyAvatarPosition } = require("@/lib/utils/avatar-position");
                        const canonicalUrl = applyAvatarPosition(avatarUrl, objectPosition, "cover");
                        onChange(canonicalUrl);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all ${
                      objectFit === "cover"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Fill (Cover)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setObjectFit("contain");
                      if (avatarUrl) {
                        const { applyAvatarPosition } = require("@/lib/utils/avatar-position");
                        const canonicalUrl = applyAvatarPosition(avatarUrl, objectPosition, "contain");
                        onChange(canonicalUrl);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl border transition-all ${
                      objectFit === "contain"
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    Fit Entire (Contain)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
              >
                Done Adjusting
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
