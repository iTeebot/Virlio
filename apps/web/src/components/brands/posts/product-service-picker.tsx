"use client";

import React, { useState } from "react";
import { Package, Briefcase, Sparkles, UploadCloud, Check, Plus, AlertCircle } from "lucide-react";
import { BrandVisualProfile } from "@virlio/ai";

interface ProductServicePickerProps {
  profile: BrandVisualProfile;
  focusType: "product" | "service" | "general" | "campaign";
  onFocusTypeChange: (type: "product" | "service" | "general" | "campaign") => void;
  selectedProduct?: string;
  onSelectProduct: (product: string | undefined) => void;
  selectedService?: string;
  onSelectService: (service: string | undefined) => void;
  onCustomImageUploaded?: (imageUrl: string) => void;
}

export function ProductServicePicker({
  profile,
  focusType,
  onFocusTypeChange,
  selectedProduct,
  onSelectProduct,
  selectedService,
  onSelectService,
  onCustomImageUploaded,
}: ProductServicePickerProps) {
  const { catalog } = profile;
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", `virlio/brands/${profile.brandId}/products`);

      const res = await fetch("/api/v1/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const json = await res.json();
        const url = json.data?.secure_url || json.secure_url;
        if (url) {
          setUploadedUrl(url);
          onCustomImageUploaded?.(url);
        }
      }
    } catch (err) {
      console.error("Failed to upload custom product asset:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Campaign Focus Type Switcher */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
          Post Creative Focus
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onFocusTypeChange("product")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
              focusType === "product"
                ? "bg-blue-50 text-blue-700 border-blue-600 shadow-2xs"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Feature</span>
          </button>

          <button
            type="button"
            onClick={() => onFocusTypeChange("service")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
              focusType === "service"
                ? "bg-purple-50 text-purple-700 border-purple-600 shadow-2xs"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Service Solution</span>
          </button>

          <button
            type="button"
            onClick={() => onFocusTypeChange("general")}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all ${
              focusType === "general"
                ? "bg-amber-50 text-amber-800 border-amber-600 shadow-2xs"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Brand Awareness</span>
          </button>
        </div>
      </div>

      {/* 2. Product Focus State */}
      {focusType === "product" && (
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-blue-600" />
              Target Brand Product
            </span>
            {catalog.products.length > 0 && (
              <span className="text-[10px] text-gray-500 font-medium">
                {catalog.products.length} catalog items found
              </span>
            )}
          </div>

          {/* If products exist in brand catalog */}
          {catalog.products.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                {catalog.products.map((p) => {
                  const isSelected = selectedProduct === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onSelectProduct(isSelected ? undefined : p)}
                      className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        isSelected
                          ? "bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs"
                          : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3" />}
                      <span>{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* If no products in catalog -> prompt to upload product asset or enter name */
            <div className="space-y-2.5">
              <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">No catalog products found for this brand.</p>
                  <p className="text-amber-700 text-[10px] mt-0.5">
                    Enter the product name below or upload a product photo for reference.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Organic Matte Face Cream"
                  value={customInput}
                  onChange={(e) => {
                    setCustomInput(e.target.value);
                    onSelectProduct(e.target.value.trim() || undefined);
                  }}
                  className="flex-1 px-3 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {/* Optional: Upload custom product photo reference */}
          <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between">
            <span className="text-[11px] text-gray-500">Have a specific product image?</span>
            <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 transition-all">
              <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span>{isUploading ? "Uploading..." : uploadedUrl ? "Asset Attached ✓" : "Upload Image"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}

      {/* 3. Service Focus State */}
      {focusType === "service" && (
        <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
              Target Brand Service / Offering
            </span>
            {catalog.services.length > 0 && (
              <span className="text-[10px] text-purple-700 font-medium">
                {catalog.services.length} services available
              </span>
            )}
          </div>

          {catalog.services.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
              {catalog.services.map((s) => {
                const isSelected = selectedService === s;
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onSelectService(isSelected ? undefined : s)}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-purple-600 text-white border-purple-600 font-semibold shadow-2xs"
                        : "bg-white text-gray-700 border-purple-200 hover:border-purple-300"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{s}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="e.g. 1-on-1 Strategic Business Advisory"
                value={customInput}
                onChange={(e) => {
                  setCustomInput(e.target.value);
                  onSelectService(e.target.value.trim() || undefined);
                }}
                className="w-full px-3 py-2 text-xs bg-white border border-purple-200 rounded-lg focus:outline-none focus:border-purple-600"
              />
              <p className="text-[10px] text-purple-700">
                Service posts generate outcome-driven, modern workplace, and editorial thought-leadership visual concepts.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
