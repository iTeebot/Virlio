"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useBrand } from "@/components/dashboard/brand-context";
import { toast } from "@/components/ui/toast";
import {
  Zap,
  Plus,
  Search,
  Filter,
  ArrowUpDown,
  Play,
  CheckCircle2,
  Clock,
  Copy,
  Trash2,
  ExternalLink,
  Loader2,
  Layers,
  Share2,
  Sparkles,
  FileText,
  Lock,
  MoreVertical,
} from "lucide-react";

interface AutomationItem {
  id: string;
  name: string;
  description: string | null;
  status: "draft" | "enabled" | "disabled";
  is_enabled: boolean;
  trigger_type: string;
  node_count: number;
  run_count: number;
  last_execution_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function BrandAutomationsListPage() {
  const router = useRouter();
  const { currentBrand } = useBrand();

  const [automations, setAutomations] = useState<AutomationItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "enabled" | "disabled" | "draft">("all");
  const [sortBy, setSortBy] = useState<"updated" | "created" | "alpha">("updated");

  // Create Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Action status
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [duplicatingId, setDuplicatingId] = useState<string | null>(null);

  const fetchAutomations = async () => {
    if (!currentBrand?.id) return;
    setLoading(true);
    try {
      const query = new URLSearchParams({
        search,
        status: statusFilter,
        sort: sortBy,
      });

      const res = await fetch(`/api/v1/brands/${currentBrand.id}/automations?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setAutomations(json.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch automations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, [currentBrand?.id, search, statusFilter, sortBy]);

  if (!currentBrand) return null;

  const handleCreateAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    setCreating(true);
    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/automations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
        }),
      });

      const json = await res.json();
      if (res.ok && json.success) {
        setShowCreateModal(false);
        setNewName("");
        setNewDescription("");
        toast.success("Automation created successfully!", "Automation Engine");
        router.push(`/dashboard/brands/${currentBrand.id}/automations/${json.data.id}`);
      } else {
        toast.error(json.error || "Failed to create automation", "Error");
      }
    } catch (err) {
      toast.error("Network error creating automation", "Error");
    } finally {
      setCreating(false);
    }
  };

  const handleToggleEnable = async (auto: AutomationItem) => {
    setTogglingId(auto.id);
    const nextState = !auto.is_enabled;

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/automations/${auto.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          is_enabled: nextState,
        }),
      });

      if (res.ok) {
        setAutomations((prev) =>
          prev.map((a) => (a.id === auto.id ? { ...a, is_enabled: nextState, status: nextState ? "enabled" : "disabled" } : a))
        );
        toast.success(nextState ? `Automation enabled!` : `Automation disabled`, "Automation Status");
      }
    } catch {
      toast.error("Failed to update status", "Error");
    } finally {
      setTogglingId(null);
    }
  };

  const handleDuplicate = async (autoId: string) => {
    setDuplicatingId(autoId);
    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/automations/${autoId}/duplicate`, {
        method: "POST",
      });

      if (res.ok) {
        toast.success("Automation duplicated!", "Duplicate");
        await fetchAutomations();
      }
    } catch {
      toast.error("Failed to duplicate automation", "Error");
    } finally {
      setDuplicatingId(null);
    }
  };

  const handleDelete = async (autoId: string) => {
    if (!confirm("Are you sure you want to delete this automation workflow?")) return;
    setDeletingId(autoId);

    try {
      const res = await fetch(`/api/v1/brands/${currentBrand.id}/automations/${autoId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setAutomations((prev) => prev.filter((a) => a.id !== autoId));
        toast.success("Automation deleted", "Deleted");
      }
    } catch {
      toast.error("Failed to delete automation", "Error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 uppercase tracking-wider">
              Virlio Workflows
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2.5">
            <Zap className="w-7 h-7 text-blue-600" />
            {currentBrand.name} Automations
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Build automated social publishing, article generation, and distribution pipelines powered by React Flow.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create Automation</span>
        </button>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-3xl p-4 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search automations..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
          {/* Status Tabs */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs font-bold">
            {(["all", "enabled", "disabled", "draft"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg capitalize transition-colors cursor-pointer ${
                  statusFilter === s ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800"
            >
              <option value="updated">Recently Updated</option>
              <option value="created">Recently Created</option>
              <option value="alpha">Alphabetical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Automation Cards List */}
      {loading ? (
        <div className="py-24 text-center bg-white border border-gray-200 rounded-3xl">
          <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-500">Loading brand automations...</p>
        </div>
      ) : automations.length === 0 ? (
        <div className="py-20 bg-white border border-gray-200 rounded-3xl text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
            <Zap className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">No automations created yet</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Automate publishing your branded memes directly to Facebook, generating SEO articles, and cross-posting.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create your first automation</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className="bg-white border border-gray-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-gray-300 transition-all"
            >
              <div className="space-y-3">
                {/* Header Badge & Title */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${
                          auto.is_enabled
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : auto.status === "draft"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {auto.is_enabled ? "Enabled" : auto.status}
                      </span>

                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                        <Sparkles className="w-3 h-3 text-amber-500" /> Meme Published Trigger
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-gray-900 pt-1">{auto.name}</h3>
                  </div>

                  {/* Enable Switch */}
                  <button
                    type="button"
                    disabled={togglingId === auto.id}
                    onClick={() => handleToggleEnable(auto)}
                    title={auto.is_enabled ? "Disable Automation" : "Enable Automation"}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                      auto.is_enabled ? "bg-emerald-600" : "bg-gray-200"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        auto.is_enabled ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                  {auto.description || "No description provided."}
                </p>

                {/* Flow preview pills */}
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 pt-1">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-100 text-[11px] font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Meme Published
                  </div>
                  <span>&rarr;</span>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg border border-indigo-100 text-[11px] font-bold">
                    <Share2 className="w-3.5 h-3.5 text-blue-600" /> Post to Facebook
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-800 rounded-lg border border-amber-200 text-[11px] font-bold">
                    <FileText className="w-3.5 h-3.5 text-amber-600" /> Generate Article <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded">Soon</span>
                  </div>
                </div>
              </div>

              {/* Stats & Actions Footer */}
              <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <span><strong>{auto.node_count}</strong> Nodes</span>
                  <span>•</span>
                  <span><strong>{auto.run_count}</strong> Runs</span>
                  <span>•</span>
                  <span className="text-[11px]">Updated {new Date(auto.updated_at).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleDuplicate(auto.id)}
                    disabled={duplicatingId === auto.id}
                    title="Duplicate Workflow"
                    className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl border border-gray-200 cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(auto.id)}
                    disabled={deletingId === auto.id}
                    title="Delete Workflow"
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-gray-200 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    href={`/dashboard/brands/${currentBrand.id}/automations/${auto.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-2xs"
                  >
                    <span>Open Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE AUTOMATION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                New Brand Automation
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-900 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateAutomation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Automation Name *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Meme to Facebook & Article Pipeline"
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Briefly describe what this workflow automates..."
                  className="w-full px-3.5 py-2.5 text-xs bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:opacity-50 flex items-center gap-1.5"
                >
                  {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Create & Open Editor</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
