"use client";

import React, { useState, useEffect } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { Bot, Save, BookOpen } from "lucide-react";

export default function BrandAIPage() {
  const { currentBrand } = useBrand();
  const [kbData, setKbData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadKb() {
      if (!currentBrand) return;
      try {
        const res = await fetch(`/api/v1/brands/${currentBrand.id}/knowledge`);
        if (res.ok) {
          const json = await res.json();
          setKbData(json.data || {});
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadKb();
  }, [currentBrand]);

  if (!currentBrand) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/v1/brands/${currentBrand.id}/knowledge`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(kbData),
      });
      alert("Brand AI Knowledge Base saved successfully!");
    } catch (err) {
      alert("Failed to save Knowledge Base.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-600" />
              {currentBrand.name} Brand AI Knowledge Base
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Configure tone, communication rules, target audience, and product details consumed by Virlio's AI.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save AI Rules"}
          </button>
        </div>

        <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-blue-600" /> Active AI Knowledge Context
          </span>
          <pre className="p-3 bg-white border border-gray-200 rounded-xl text-xs font-mono text-gray-800 overflow-x-auto max-h-96">
            {JSON.stringify(kbData || { brand: currentBrand.name, industry: currentBrand.industry }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
