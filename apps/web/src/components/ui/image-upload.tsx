"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, Link as LinkIcon, Image as ImageIcon, Trash2, RefreshCw, AlertCircle, Check, Loader2 } from "lucide-react";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  helperText?: string;
  folder?: string;
  aspectRatio?: "square" | "banner";
  error?: string;
  id?: string;
}

export function ImageUpload({
  value,
  onChange,
  label,
  helperText,
  folder = "virlio/brand-assets",
  aspectRatio = "square",
  error,
  id = "image-upload",
}: ImageUploadProps) {
  const [tab, setTab] = useState<"file" | "url">("file");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setUploadError(null);

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size exceeds max 5MB limit.");
      return;
    }

    // Validate type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Only JPEG, PNG, WEBP, GIF, and SVG images are supported.");
      return;
    }

    setUploading(true);
    setUploadProgress(30);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      setUploadProgress(80);
      const json = await res.json();

      if (res.ok && json.url) {
        setUploadProgress(100);
        onChange(json.url);
      } else {
        setUploadError(json.message || "Failed to upload image.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Connection error during upload.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUrlUpload = async () => {
    if (!urlInput.trim()) return;
    setUploadError(null);
    setUploading(true);

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), folder }),
      });

      const json = await res.json();
      if (res.ok && json.url) {
        onChange(json.url);
        setUrlInput("");
      } else {
        setUploadError(json.message || "Failed to process image URL.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Failed to reach upload server.");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex items-center justify-between">
          <label htmlFor={id} className="block text-sm font-semibold text-gray-800 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-gray-500" />
            {label}
          </label>

          {!value && (
            <div className="flex items-center gap-1 bg-gray-100 p-0.5 rounded-lg text-[11px] font-semibold">
              <button
                type="button"
                onClick={() => setTab("file")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  tab === "file" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => setTab("url")}
                className={`px-2 py-0.5 rounded-md transition-colors ${
                  tab === "url" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Image URL
              </button>
            </div>
          )}
        </div>
      )}

      {/* Image Preview Active State */}
      {value ? (
        <div className="relative p-3 bg-white border border-gray-200 rounded-2xl shadow-xs space-y-3">
          <div className="flex items-center gap-4">
            <div
              className={`relative overflow-hidden rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0 ${
                aspectRatio === "square" ? "w-20 h-20" : "w-48 h-20"
              }`}
            >
              <img src={value} alt="Uploaded asset preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Uploaded</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-2xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Replace
                </button>

                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove
                </button>
              </div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFile(e.target.files[0]);
              }
            }}
          />
        </div>
      ) : (
        /* Dropzone / Upload Mode */
        <div className="space-y-2">
          {tab === "file" ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-blue-600 bg-blue-50/60"
                  : "border-gray-300 hover:border-blue-500 bg-gray-50/50 hover:bg-blue-50/20"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFile(e.target.files[0]);
                  }
                }}
              />

              {uploading ? (
                <div className="space-y-3 py-2">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-gray-800">Uploading image to Cloudinary...</p>
                  <div className="w-48 h-1.5 bg-gray-200 rounded-full mx-auto overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-600 hover:underline">Click to upload</span>
                    <span className="text-xs text-gray-600"> or drag and drop image</span>
                  </div>
                  <p className="text-[11px] text-gray-400">PNG, JPG, WEBP, GIF or SVG (max 5MB)</p>
                </div>
              )}
            </div>
          ) : (
            /* URL Mode */
            <div className="p-4 bg-white border border-gray-300 rounded-2xl space-y-3 shadow-xs">
              <label className="block text-xs font-semibold text-gray-700">Paste Public Image URL</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://example.com/logo.png"
                    className="w-full pl-9 pr-3.5 py-2 text-xs bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleUrlUpload}
                  disabled={uploading || !urlInput.trim()}
                  className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {uploading ? "Processing..." : "Import Image"}
                </button>
              </div>
            </div>
          )}

          {(uploadError || error) && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {uploadError || error}
            </p>
          )}

          {helperText && !uploadError && !error && (
            <p className="text-xs text-gray-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
}
