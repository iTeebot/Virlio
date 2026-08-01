"use client";

import React, { useState } from "react";
import { useBrand } from "@/components/dashboard/brand-context";
import { Settings, Save } from "lucide-react";

export default function BrandSettingsPage() {
  const { currentBrand } = useBrand();
  const [formData, setFormData] = useState({
    name: currentBrand?.name || "",
    description: currentBrand?.description || "",
    website: currentBrand?.website || "",
    contact_email: currentBrand?.contact_email || "",
  });
  const [saving, setSaving] = useState(false);

  if (!currentBrand) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        alert("Brand settings updated successfully!");
      }
    } catch (err) {
      alert("Failed to update brand settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          {currentBrand.name} Brand Settings
        </h1>

        <form onSubmit={handleSave} className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Brand Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl font-bold text-gray-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Short Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Official Website</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Business Contact Email</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </form>
      </div>
    </div>
  );
}
