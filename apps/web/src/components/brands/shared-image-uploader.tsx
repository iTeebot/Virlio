"use client";

import React, { useState, useRef } from "react";
import { Upload, Link as LinkIcon, Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle, Trash2, Eye } from "lucide-react";

interface SharedImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
  folder?: string;
  aspectRatio?: "square" | "banner" | "flexible";
  maxSizeMb?: number;
  className?: string;
}

export function SharedImageUploader({
  value,
  onChange,
  label = "Upload Image",
  description = "PNG, JPG, WEBP, or SVG up to 5MB",
  folder = "virlio/brand-assets",
  aspectRatio = "flexible",
  maxSizeMb = 5,
  className = "",
}: SharedImageUploaderProps) {
  const [uploadMode, setUploadMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Direct File Upload (Device / Drag & Drop)
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setError(null);

    // Validation
    if (file.size > maxSizeMb * 1024 * 1024) {
      setError(`File size exceeds maximum limit of ${maxSizeMb}MB.`);
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Please upload a JPEG, PNG, WEBP, GIF, or SVG image.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 85 ? prev : prev + 15));
    }, 200);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      const json = await res.json();
      if (res.ok && json.url) {
        setUploadProgress(100);
        setTimeout(() => {
          onChange(json.url);
          setIsUploading(false);
          setUploadProgress(0);
        }, 300);
      } else {
        throw new Error(json.message || "Failed to upload image.");
      }
    } catch (err: any) {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.message || "Image upload failed. Please try again.");
    }
  };

  // 2. Upload from Image URL
  const handleUrlUpload = async () => {
    if (!urlInput || !urlInput.trim()) return;
    setError(null);
    setIsUploading(true);
    setUploadProgress(30);

    try {
      const res = await fetch("/api/v1/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput.trim(), folder }),
      });

      const json = await res.json();
      if (res.ok && json.url) {
        setUploadProgress(100);
        setTimeout(() => {
          onChange(json.url);
          setUrlInput("");
          setIsUploading(false);
          setUploadProgress(0);
        }, 300);
      } else {
        throw new Error(json.message || "Failed to fetch image from URL.");
      }
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.message || "Failed to upload image from URL.");
    }
  };

  // Drag Events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  const aspectClasses =
    aspectRatio === "square"
      ? "aspect-square max-w-[180px]"
      : aspectRatio === "banner"
      ? "aspect-[3/1] w-full"
      : "min-h-[140px] w-full";

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-gray-800">{label}</label>
          <div className="flex items-center gap-1 text-[11px] bg-gray-100 p-0.5 rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => setUploadMode("file")}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                uploadMode === "file" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("url")}
              className={`px-2 py-0.5 rounded-md font-semibold transition-colors ${
                uploadMode === "url" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Paste URL
            </button>
          </div>
        </div>
      )}

      {/* Image Preview State (When image is uploaded) */}
      {value ? (
        <div className="relative group p-3 bg-gray-50 border border-gray-200 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className={`relative overflow-hidden rounded-xl bg-white border border-gray-200 shrink-0 ${aspectRatio === "square" ? "w-16 h-16" : "w-24 h-16"}`}>
            <img src={value} alt="Uploaded Asset" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Uploaded & Optimized
            </span>
            <p className="text-xs text-gray-500 truncate mt-1">Cloudinary CDN asset ready</p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-500 hover:text-blue-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
              title="View full asset"
            >
              <Eye className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={handleRemove}
              className="p-2 text-gray-400 hover:text-red-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-xs"
              title="Remove image"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : uploadMode === "file" ? (
        /* Drag & Drop File Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={label}
          className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${aspectClasses} ${
            isDragging
              ? "border-blue-600 bg-blue-50/70 scale-[0.99]"
              : "border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50/50"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          {isUploading ? (
            <div className="w-full space-y-3 text-center p-4">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
              <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs font-semibold text-gray-700">Uploading & Optimizing image... {uploadProgress}%</p>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto text-blue-600">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">
                  <span className="text-blue-600">Click to upload</span> or drag and drop
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Paste Image URL Input Area */
        <div className="p-4 bg-white border border-gray-300 rounded-2xl space-y-3 shadow-xs">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/image.png"
                className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-gray-300 text-gray-900 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlUpload}
              disabled={isUploading || !urlInput.trim()}
              className="px-4 py-2 text-xs font-bold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isUploading ? "Uploading..." : "Upload URL"}
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1 bg-red-50 p-2 rounded-xl border border-red-200">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
